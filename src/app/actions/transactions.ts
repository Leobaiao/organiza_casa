"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerPayment(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const amount = formData.get("amount") as string;
  const description = formData.get("description") as string;
  const householdId = formData.get("householdId") as string;

  if (!amount || !householdId) {
    return { error: "Valor e ID da casa são obrigatórios." };
  }

  // Insert transaction as a credit (positive amount)
  const { error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      amount: parseFloat(amount),
      description: description || "Pagamento registrado",
      status: "confirmed",
      household_id: householdId
    });

  if (error) {
    console.error("Error registering payment:", error);
    return { error: "Falha ao registrar pagamento." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}
