import { createClient } from "./server";

export async function getBills(householdId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bills")
    .select("*, participants(user_id)")
    .eq("household_id", householdId)
    .order("due_date", { ascending: true });
    
  if (error) {
    console.error("Error fetching bills:", error);
    return [];
  }
  return data;
}
