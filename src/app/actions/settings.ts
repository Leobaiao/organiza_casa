"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const fullName = formData.get("fullName") as string;
  const whatsappNumber = formData.get("whatsappNumber") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ 
      full_name: fullName,
      whatsapp_number: whatsappNumber 
    })
    .eq("id", user.id);

  if (error) return { error: "Falha ao atualizar perfil." };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/members");
  return { success: "Perfil atualizado com sucesso!" };
}

export async function updateHouseholdName(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const householdId = formData.get("householdId") as string;
  const name = formData.get("name") as string;

  // Verify if user is admin of this household
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: "Apenas administradores podem mudar o nome da casa." };
  }

  const { error } = await supabaseAdmin
    .from("households")
    .update({ name })
    .eq("id", householdId);

  if (error) return { error: "Falha ao atualizar nome da casa." };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: "Nome da casa atualizado!" };
}
