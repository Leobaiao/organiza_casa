"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/supabase/user";

export async function removeMember(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  // Check if current user is admin
  const adminProfile = await getProfile(user.id);
  if (adminProfile?.role !== 'admin') return { error: "Apenas administradores podem remover membros." };

  const memberId = formData.get("memberId") as string;
  if (!memberId) return { error: "ID do membro é obrigatório." };
  
  if (memberId === user.id) return { error: "Você não pode se remover da casa." };

  // Unlink member from household using admin client to bypass RLS if needed
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ 
      household_id: null,
      role: 'admin' // Default role when alone
    })
    .eq("id", memberId)
    .eq("household_id", adminProfile.household_id); // Security: ensure member is in the same house

  if (error) {
    console.error("Error removing member:", error);
    return { error: "Falha ao remover membro." };
  }

  revalidatePath("/dashboard/members");
  return { success: true };
}

export async function toggleAdmin(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const adminProfile = await getProfile(user.id);
  if (adminProfile?.role !== 'admin') return { error: "Apenas administradores podem alterar cargos." };

  const memberId = formData.get("memberId") as string;
  const currentRole = formData.get("currentRole") as string;
  const newRole = currentRole === 'admin' ? 'member' : 'admin';

  if (memberId === user.id) return { error: "Você não pode alterar seu próprio cargo." };

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("household_id", adminProfile.household_id);

  if (error) {
    console.error("Error toggling admin:", error);
    return { error: "Falha ao alterar cargo." };
  }

  revalidatePath("/dashboard/members");
  return { success: true };
}
