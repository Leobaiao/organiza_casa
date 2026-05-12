import { createClient } from "./server";
import { cookies } from "next/headers";

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

export async function getProfile(userId: string) {
  if (!userId) return null;
  
  const cookieStore = await cookies();
  const supabase = await createClient();
  
  // Diagnostic log
  const { data: { user } } = await supabase.auth.getUser();


  const { data, error } = await supabase
    .from("profiles")
    .select("*, households(*)")
    .eq("id", userId)
    .maybeSingle();
    
  if (error) {
    console.error(`[getProfile] Error for ${userId}:`, error.code, error.message);
    return null;
  }
  

  return data;
}
