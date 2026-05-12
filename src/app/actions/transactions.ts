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
  const billId = formData.get("billId") as string;
  const receiptFile = formData.get("receipt") as File | null;

  if (!amount || !householdId) {
    return { error: "Valor e ID da casa são obrigatórios." };
  }

  let receiptUrl = null;

  // Handle file upload if present
  if (receiptFile && receiptFile.size > 0) {
    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('receipts') 
      .upload(filePath, receiptFile);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);
      receiptUrl = publicUrl;
    } else {
      console.error("Upload error:", uploadError);
      // We continue even if upload fails, but we could return error
    }
  }

  // Insert transaction as a credit (positive amount)
  const { error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      amount: parseFloat(amount),
      description: description || "Pagamento registrado",
      status: "confirmed",
      household_id: householdId,
      bill_id: billId || null,
      receipt_url: receiptUrl
    });

  if (error) {
    console.error("Error registering payment:", error);
    return { error: "Falha ao registrar pagamento." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}
