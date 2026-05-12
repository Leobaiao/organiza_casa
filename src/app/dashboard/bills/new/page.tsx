import { getUser, getProfile } from "@/lib/supabase/user";
import { getHouseholdMembers } from "@/lib/supabase/members";
import { redirect } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddBillForm } from "@/components/dashboard/add-bill-form";

export const dynamic = "force-dynamic";

export default async function NewBillPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.household_id) redirect("/onboarding");

  const members = await getHouseholdMembers(profile.household_id);

  return (
    <div className="max-w-md mx-auto space-y-6 py-4 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Nova Conta</h1>
      </div>

      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden border-t-indigo-500 border-t-2">
        <CardHeader>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Receipt className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cadastrar Despesa</span>
          </div>
          <CardTitle className="text-white text-xl">Detalhes da Conta</CardTitle>
          <CardDescription className="text-slate-400">
            Adicione uma conta para dividir com os membros.
          </CardDescription>
        </CardHeader>
        
        <AddBillForm members={members} />
      </Card>
    </div>
  );
}
