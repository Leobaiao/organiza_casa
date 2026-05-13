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
    .select("*, transactions(user_id, amount)")
    .eq("household_id", householdId)
    .gte("due_date", new Date().toISOString().split('T')[0])
    .order("due_date", { ascending: true })
    .limit(3);

  const processedUpcoming = upcomingBills?.map(bill => {
    const userTransactions = (bill.transactions as any[])?.filter(t => t.user_id === userId) || [];
    const userBalance = userTransactions.reduce((acc, t) => acc + t.amount, 0);
    
    // Calculate user's share (debt)
    const userDebt = userTransactions.find(t => t.amount < 0)?.amount || 0;

    return {
      ...bill,
      userHasPaid: userBalance >= -0.01 && userTransactions.length > 0,
      userShare: Math.abs(userDebt)
    };
  });

  return {
    personalBalance,
    householdTotal,
    upcomingBills: processedUpcoming || [],
  };
}
