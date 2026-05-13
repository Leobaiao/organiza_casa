import { supabaseAdmin } from "./admin";

export async function getTransactions(householdId: string) {
  const supabase = supabaseAdmin;
  
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data;
}
