import { createClient } from "./server";

export async function getHouseholdMembers(householdId: string) {
  const supabase = await createClient();
  
  // 1. Get profiles
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("id, full_name, role, whatsapp_number")
    .eq("household_id", householdId);
    
  if (pError) {
    console.error("Error fetching members:", pError);
    return [];
  }

  // 2. Get balances for these members
  const { data: balances, error: bError } = await supabase
    .from("transactions")
    .select("user_id, amount")
    .eq("household_id", householdId)
    .eq("status", "confirmed");

  if (bError) {
    console.error("Error fetching balances:", bError);
    return profiles.map(p => ({ ...p, balance: 0 }));
  }

  // 3. Map balances to profiles
  return profiles.map(profile => {
    const userBalance = balances
      .filter(b => b.user_id === profile.id)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    return {
      ...profile,
      balance: userBalance
    };
  });
}
