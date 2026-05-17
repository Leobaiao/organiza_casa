"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/user";
import { revalidatePath } from "next/cache";

export async function createBill(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Não autorizado." };

  const name = formData.get("name") as string;
  const rawAmount = formData.get("amount") as string;
  const amount = Number(rawAmount?.replace(",", "."));
  const dueDate = formData.get("dueDate") as string;
  const type = formData.get("type") as 'fixed' | 'variable';
  const category = (formData.get("category") as string) || "other";
  const participantIds = formData.getAll("memberIds") as string[];

  if (!name || !amount || !dueDate || !participantIds || participantIds.length === 0) {
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
      category,
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
  console.log("[updateBill] Starting update...");
  const user = await getUser();
  if (!user) {
    console.log("[updateBill] Unauthorized user");
    return { error: "Não autorizado." };
  }

  const billId = formData.get("billId") as string;
  const name = formData.get("name") as string;
  const rawAmount = formData.get("amount") as string;
  const amount = Number(rawAmount?.replace(",", "."));
  const dueDate = formData.get("dueDate") as string;
  const category = (formData.get("category") as string) || "other";
  const participantIds = formData.getAll("memberIds") as string[];

  console.log("[updateBill] Params:", { billId, name, amount, dueDate, category, participantIds });

  if (!billId || !name || !amount || !dueDate || participantIds.length === 0) {
    console.log("[updateBill] Missing fields", { billId, name, amount, dueDate, participantIdsLength: participantIds.length });
    return { error: "Dados incompletos. Informe o nome, valor, data e ao menos um participante." };
  }

  // 1. Update the bill
  console.log("[updateBill] Updating bill in DB...");
  const { error: billError } = await supabaseAdmin
    .from("bills")
    .update({ name, total_amount: amount, due_date: dueDate, category })
    .eq("id", billId);

  if (billError) {
    console.error("[updateBill] Bill update error:", billError);
    return { error: billError.message };
  }

  // 2. Pre-calculate the new split amount
  const newSplitAmount = -(amount / participantIds.length);
  console.log("[updateBill] New split amount:", newSplitAmount);

  // 3. Manage participants/transactions
  console.log("[updateBill] Managing participants...");
  const { data: existingDebts, error: fetchDebtsError } = await supabaseAdmin
    .from("transactions")
    .select("user_id")
    .eq("bill_id", billId)
    .lt("amount", 0);

  if (fetchDebtsError) {
    console.error("[updateBill] Error fetching debts:", fetchDebtsError);
    return { error: fetchDebtsError.message };
  }

  const existingParticipantIds = new Set(existingDebts?.map(d => d.user_id) || []);
  const newParticipantIdsSet = new Set(participantIds);

  const toRemove = [...existingParticipantIds].filter(id => !newParticipantIdsSet.has(id));
  const toAdd = participantIds.filter(id => !existingParticipantIds.has(id));

  console.log("[updateBill] Changes:", { toRemove, toAdd });

  // 4. Remove debt transactions for removed participants
  if (toRemove.length > 0) {
    console.log("[updateBill] Removing participants:", toRemove);
    const { error: deleteError } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("bill_id", billId)
      .in("user_id", toRemove)
      .lt("amount", 0);

    if (deleteError) {
      console.error("[updateBill] Error deleting transactions:", deleteError);
      return { error: deleteError.message };
    }
  }

  // 5. Add new debt transactions for added participants
  if (toAdd.length > 0) {
    console.log("[updateBill] Adding participants:", toAdd);
    const { data: bill, error: fetchBillError } = await supabaseAdmin.from("bills").select("household_id").eq("id", billId).single();
    
    if (fetchBillError) {
      console.error("[updateBill] Error fetching bill:", fetchBillError);
      return { error: fetchBillError.message };
    }

    if (bill) {
      const inserts = toAdd.map(id => ({
        user_id: id,
        bill_id: billId,
        household_id: bill.household_id,
        amount: newSplitAmount,
        description: `Rateio: ${name}`,
        status: 'confirmed'
      }));
      
      const { error: insertError } = await supabaseAdmin.from("transactions").insert(inserts);
      if (insertError) {
        console.error("[updateBill] Error inserting transactions:", insertError);
        return { error: insertError.message };
      }
    }
  }

  // 6. Recalculate and update ALL debts for this bill
  console.log("[updateBill] Recalculating splits...");
  const { error: updateError } = await supabaseAdmin
    .from("transactions")
    .update({ 
      amount: newSplitAmount,
      description: `Rateio: ${name}`
    })
    .eq("bill_id", billId)
    .lte("amount", 0);

  if (updateError) {
    console.error("[updateBill] Error updating transaction amounts:", updateError);
    return { error: updateError.message };
  }

  console.log("[updateBill] Success!");
  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function payBill(billId: string, userId: string, amount: number, billName: string) {
  const user = await getUser();
  if (!user) return { error: "Não autorizado." };

  const targetUserId = userId === "me" ? user.id : userId;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("household_id")
    .eq("id", user.id)
    .single();

  if (!profile?.household_id) return { error: "Casa não encontrada." };

  // PREVENT DUPLICATE PAYMENTS: Check current balance for this bill/user
  const { data: existingTransactions } = await supabaseAdmin
    .from("transactions")
    .select("amount")
    .eq("user_id", targetUserId)
    .eq("bill_id", billId);

  const currentBalance = existingTransactions?.reduce((acc, t) => acc + t.amount, 0) || 0;
  
  if (currentBalance >= -0.01) {
    return { error: "Esta conta já está paga ou não possui pendências para você." };
  }

  const { error } = await supabaseAdmin.from("transactions").insert({
    user_id: targetUserId,
    amount: Math.abs(amount), // Ensure it's positive
    description: `Pagamento: ${billName}`,
    status: 'confirmed',
    household_id: profile.household_id,
    bill_id: billId
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function payAllUserDebts() {
  const user = await getUser();
  if (!user) return { error: "Não autorizado." };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("household_id")
    .eq("id", user.id)
    .single();

  if (!profile?.household_id) return { error: "Casa não encontrada." };

  // 1. Get all transactions for this user to calculate current balance per bill
  const { data: transactions, error: tError } = await supabaseAdmin
    .from("transactions")
    .select("bill_id, amount, bills(name)")
    .eq("user_id", user.id)
    .eq("household_id", profile.household_id);

  if (tError) return { error: tError.message };

  // Group by bill_id to find total balance per bill
  const billBalances: Record<string, { amount: number, name: string }> = {};
  let generalCredit = 0;

  transactions.forEach(t => {
    if (!t.bill_id) {
      generalCredit += t.amount;
      return;
    }
    if (!billBalances[t.bill_id]) {
      billBalances[t.bill_id] = { amount: 0, name: (t.bills as any)?.name || "Conta" };
    }
    billBalances[t.bill_id].amount += t.amount;
  });

  const billsList = Object.entries(billBalances).map(([id, data]) => ({ id, ...data }));

  if (generalCredit > 0) {
    // 1. Exact match
    for (const bill of billsList) {
      if (bill.amount < -0.01 && Math.abs(bill.amount) === generalCredit) {
        bill.amount = 0;
        generalCredit = 0;
        break;
      }
    }
    // 2. Oldest first (fallback)
    if (generalCredit > 0) {
      for (const bill of billsList) {
        if (bill.amount < -0.01) {
          const debt = Math.abs(bill.amount);
          if (generalCredit >= debt) {
            generalCredit -= debt;
            bill.amount = 0;
          } else {
            bill.amount += generalCredit;
            generalCredit = 0;
            break;
          }
        }
      }
    }
  }

  // Filter bills where user still owes money (balance < 0)
  const debtsToPay = billsList
    .filter(data => data.amount < -0.01)
    .map(data => ({
      user_id: user.id,
      amount: Math.abs(data.amount),
      description: `Pagamento Total: ${data.name}`,
      status: 'confirmed',
      household_id: profile.household_id,
      bill_id: data.id
    }));

  if (debtsToPay.length === 0) {
    return { success: true };
  }

  // 2. Insert all payment transactions
  const { error: insertError } = await supabaseAdmin.from("transactions").insert(debtsToPay);

  if (insertError) return { error: insertError.message };

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getUserDebts() {
  const user = await getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("household_id")
    .eq("id", user.id)
    .single();

  if (!profile?.household_id) return null;

  const { data: transactions } = await supabaseAdmin
    .from("transactions")
    .select("bill_id, amount, bills(id, name, due_date)")
    .eq("user_id", user.id)
    .eq("household_id", profile.household_id);

  if (!transactions) return [];

  const billBalances: Record<string, any> = {};
  let generalCredit = 0;

  transactions.forEach(t => {
    if (!t.bill_id) {
      generalCredit += t.amount;
      return;
    }
    if (!billBalances[t.bill_id]) {
      billBalances[t.bill_id] = { 
        id: t.bill_id,
        amount: 0, 
        name: (t.bills as any)?.name || "Conta",
        dueDate: (t.bills as any)?.due_date
      };
    }
    billBalances[t.bill_id].amount += t.amount;
  });

  const billsList = Object.values(billBalances);

  if (generalCredit > 0) {
    // 1. Exact match
    for (const bill of billsList) {
      if (bill.amount < -0.01 && Math.abs(bill.amount) === generalCredit) {
        bill.amount = 0;
        generalCredit = 0;
        break;
      }
    }
    // 2. Oldest first
    if (generalCredit > 0) {
      billsList.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      for (const bill of billsList) {
        if (bill.amount < -0.01) {
          const debt = Math.abs(bill.amount);
          if (generalCredit >= debt) {
            generalCredit -= debt;
            bill.amount = 0;
          } else {
            bill.amount += generalCredit;
            generalCredit = 0;
            break;
          }
        }
      }
    }
  }

  return billsList.filter(b => b.amount < -0.01);
}

