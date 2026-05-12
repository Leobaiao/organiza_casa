import { createClient } from "./server";

export async function getDashboardStats(userId: string, householdId: string) {
  const supabase = await createClient();
  
  // 1. Get user balance (sum of transactions)
  const { data: balanceData } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("status", "confirmed");

  const personalBalance = balanceData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  // 2. Get household total pending bills (this month)
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const { data: billsData } = await supabase
    .from("bills")
    .select("total_amount")
    .eq("household_id", householdId)
    .gte("due_date", firstDay);

  const householdTotal = billsData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

  // 3. Get upcoming bills (next 3)
  const { data: upcomingBills } = await supabase
    .from("bills")
    .select("*")
    .eq("household_id", householdId)
    .gte("due_date", new Date().toISOString().split('T')[0])
    .order("due_date", { ascending: true })
    .limit(3);

  return {
    personalBalance,
    householdTotal,
    upcomingBills: upcomingBills || [],
  };
}
