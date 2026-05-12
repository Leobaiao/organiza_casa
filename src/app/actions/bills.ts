"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/user";
import { revalidatePath } from "next/cache";

export async function createBill(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Não autorizado." };

  const name = formData.get("name") as string;
  const amount = Number(formData.get("amount"));
  const dueDate = formData.get("dueDate") as string;
  const type = formData.get("type") as 'fixed' | 'variable';
  const participantIds = formData.getAll("participants") as string[];

  if (!name || !amount || !dueDate || !participantIds.length) {
    return { error: "Todos os campos são obrigatórios, incluindo ao menos um participante." };
  }

  // 1. Get user profile to get household_id
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("household_id")
    .eq("id", user.id)
    .single();

  if (!profile?.household_id) return { error: "Casa não encontrada." };

  // 2. Insert Bill
  const { data: bill, error: billError } = await supabaseAdmin
    .from("bills")
    .insert({
      name,
      total_amount: amount,
      due_date: dueDate,
      type,
      household_id: profile.household_id
    })
    .select()
    .single();

  if (billError) return { error: billError.message };

  // 3. Insert Participants & Transactions (Debits)
  const splitAmount = -(amount / participantIds.length);
  
  const participantInserts = participantIds.map(id => ({
    bill_id: bill.id,
    user_id: id
  }));

  const transactionInserts = participantIds.map(id => ({
    user_id: id,
    amount: splitAmount,
    description: `Rateio: ${name}`,
    status: 'confirmed',
    household_id: profile.household_id
  }));

  const { error: pError } = await supabaseAdmin.from("participants").insert(participantInserts);
  const { error: tError } = await supabaseAdmin.from("transactions").insert(transactionInserts);

  if (pError || tError) {
    console.error("Error splitting bill:", pError || tError);
    return { error: "Erro ao dividir a conta entre participantes." };
  }

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBill(billId: string) {
  const { error } = await supabaseAdmin.from("bills").delete().eq("id", billId);
  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return { success: true };
}
