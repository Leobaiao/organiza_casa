"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase handles session
  const { data: profile } = await supabase
    .from("profiles")
    .select("household_id")
    .eq("id", data.user.id)
    .single();

  if (!profile?.household_id) {
    redirect("/onboarding");
  }
  
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return { error: "Todos os campos são obrigatórios." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Insert profile using admin client to bypass RLS during signup
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: data.user.id,
        full_name: fullName,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
    }
  }

  // Redirect to a check-email page or dashboard if auto-confirm is on
  redirect("/login?message=Verifique seu e-mail para confirmar o cadastro.");
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  
  redirect("/");
}
