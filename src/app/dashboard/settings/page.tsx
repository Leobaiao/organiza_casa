import { getUser, getProfile } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile || !profile.household_id) redirect("/onboarding");

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400">Gerencie suas informações e as preferências da casa.</p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  );
}
