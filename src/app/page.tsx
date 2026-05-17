import { getUser, getProfile } from "@/lib/supabase/user";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(user.id);
  if (!profile?.household_id) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
