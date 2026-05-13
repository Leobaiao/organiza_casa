"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createHousehold(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Não autorizado." };

  const name = formData.get("name") as string;
  if (!name) return { error: "O nome da casa é obrigatório." };

  // 1. Create household
  const { data: household, error: hError } = await supabaseAdmin
    .from("households")
    .insert({ name })
    .select()
    .single();

  if (hError) {
    console.error("[createHousehold] Error creating house:", hError);
    return { error: hError.message };
  }



  // 2. Upsert profile — creates if missing, updates if exists
  const { data: upsertedProfile, error: pError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email || "Usuário",
      household_id: household.id,
      role: 'admin'
    }, { onConflict: 'id' })
    .select("id, household_id, role")
    .single();

  if (pError) {
    console.error("[createHousehold] Upsert error:", pError);
    return { error: pError.message };
  }



  // 3. Verification read — confirm it's actually in the DB
  const { data: verify } = await supabaseAdmin
    .from("profiles")
    .select("id, household_id")
    .eq("id", user.id)
    .single();



  if (!verify?.household_id) {
    console.error("[createHousehold] CRITICAL: household_id is still null after upsert!");
    return { error: "Falha ao vincular perfil à casa. Tente novamente." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function joinHousehold(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Não autorizado." };

  const householdId = formData.get("householdId") as string;
  if (!householdId) return { error: "O ID da casa é obrigatório." };

  // Check if household exists
  const { data: household, error: hError } = await supabaseAdmin
    .from("households")
    .select("id")
    .eq("id", householdId)
    .single();

  if (hError || !household) return { error: "Casa não encontrada." };

  // Upsert profile
  const { data: upsertedProfile, error: pError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email || "Usuário",
      household_id: household.id,
      role: 'member'
    }, { onConflict: 'id' })
    .select("id, household_id")
    .single();

  if (pError) {
    console.error("[joinHousehold] Upsert error:", pError);
    return { error: pError.message };
  }



  revalidatePath("/", "layout");
  return { success: true };
}

export async function leaveHousehold() {
  const user = await getUser();
  if (!user) return { error: "Não autorizado." };

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ 
      household_id: null,
      role: 'member' // Reset role too
    })
    .eq("id", user.id);

  if (error) {
    console.error("[leaveHousehold] Error leaving house:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

