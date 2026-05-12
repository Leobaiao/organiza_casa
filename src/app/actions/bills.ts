"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/user";
import { revalidatePath } from "next/cache";

export async function createBill(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Não autorizado." };

  const name = formData.get("name") as string;
  const amount = Number(formData.get("amount"));
  const dueDate = formData.get("dueDate") as string;
  const type = formData.get("type") as 'fixed' | 'variable';
  const participantIds = formData.getAll("memberIds") as string[];

  if (!name || !amount || !dueDate || !participantIds.length) {
    return { error: "Todos os campos são obrigatórios, incluindo ao menos um participante." };
  }

  // 1. Get user profile
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

  // 3. Insert Split Transactions (Debits)
  const splitAmount = -(amount / participantIds.length);
  
  const transactionInserts = participantIds.map(id => ({
    user_id: id,
    amount: splitAmount,
    description: `Rateio: ${name}`,
    status: 'confirmed',
    household_id: profile.household_id,
    bill_id: bill.id // Linking transaction to bill
  }));

  const { error: tError } = await supabaseAdmin.from("transactions").insert(transactionInserts);

  if (tError) {
    console.error("Error splitting bill:", tError);
    // Rollback bill if transactions fail
    await supabaseAdmin.from("bills").delete().eq("id", bill.id);
    return { error: "Erro ao dividir a conta entre participantes." };
  }

  // 4. Notify participants via WhatsApp (Fire and forget)
  try {
    const { data: participantsWithPhones } = await supabaseAdmin
      .from("profiles")
      .select("whatsapp_number, full_name")
      .in("id", participantIds);

    if (participantsWithPhones && participantsWithPhones.length > 0) {
      const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
      const dueDateFormatted = new Date(dueDate).toLocaleDateString('pt-BR');
      const individualAmount = amount / participantIds.length;
      
      participantsWithPhones.forEach((p) => {
        if (p.whatsapp_number) {
          const message = `🏠 *Organiza Casa*\n\nOlá ${p.full_name}! Uma nova conta de *${name}* foi cadastrada.\n\n💰 *Valor Total:* R$ ${amount.toFixed(2)}\n📉 *Sua Parte:* R$ ${individualAmount.toFixed(2)}\n📅 *Vencimento:* ${dueDateFormatted}\n\nAbra o app para ver mais detalhes!`;
          sendWhatsAppMessage(p.whatsapp_number, message);
        }
      });
    }
  } catch (err) {
    console.error("Error in WhatsApp notification flow:", err);
  }

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBill(billId: string) {
  // Transactions are linked via bill_id, so we delete them first
  // Assuming ON DELETE CASCADE is NOT enabled, we do it manually
  await supabaseAdmin.from("transactions").delete().eq("bill_id", billId);
  
  const { error } = await supabaseAdmin.from("bills").delete().eq("id", billId);
  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBill(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Não autorizado." };

  const billId = formData.get("billId") as string;
  const name = formData.get("name") as string;
  const amount = Number(formData.get("amount"));
  const dueDate = formData.get("dueDate") as string;

  if (!billId || !name || !amount || !dueDate) {
    return { error: "Dados incompletos para atualização." };
  }

  // 1. Update the bill
  const { error: billError } = await supabaseAdmin
    .from("bills")
    .update({ name, total_amount: amount, due_date: dueDate })
    .eq("id", billId);

  if (billError) return { error: billError.message };

  // 2. Update existing transactions amounts (Recalculate splits)
  // Get current participants count for this bill
  const { data: transactions } = await supabaseAdmin
    .from("transactions")
    .select("id")
    .eq("bill_id", billId);

  if (transactions && transactions.length > 0) {
    const newSplitAmount = -(amount / transactions.length);
    
    const { error: tError } = await supabaseAdmin
      .from("transactions")
      .update({ 
        amount: newSplitAmount,
        description: `Rateio: ${name}`
      })
      .eq("bill_id", billId);

    if (tError) console.error("Error updating split transactions:", tError);
  }

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return { success: true };
}
