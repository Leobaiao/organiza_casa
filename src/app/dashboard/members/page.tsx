import { getUser, getProfile } from "@/lib/supabase/user";
import { getHouseholdMembers } from "@/lib/supabase/members";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, UserCircle, Share2, Wallet } from "lucide-react";
import { CopyButton } from "@/components/dashboard/copy-button";

export default async function MembersPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  
  if (!profile || !profile.household_id) {
    redirect("/onboarding");
  }

  const members = await getHouseholdMembers(profile.household_id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Membros</h1>
          <p className="text-slate-400">Pessoas que dividem as contas com você em {profile.households.name}.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Invitation Card */}
        <Card className="md:col-span-1 border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center mb-2">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white">Convidar Membros</CardTitle>
            <CardDescription className="text-slate-400">
              Compartilhe este ID com as pessoas que moram com você.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 break-all font-mono text-xs text-indigo-300">
              {profile.household_id}
            </div>
            <CopyButton text={profile.household_id} />
          </CardContent>
        </Card>

        {/* Members List */}
        <div className="md:col-span-2 grid gap-4">
          {members.map((member: any) => (
            <Card key={member.id} className="border-slate-800 bg-slate-900/50 backdrop-blur-xl hover:border-slate-700 transition-all">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <UserCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{member.full_name}</p>
                      {member.role === "admin" && (
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-none h-5 px-1.5 text-[10px]">
                          <Shield className="h-3 w-3 mr-1" /> Admin
                        </Badge>
                      )}
                      {member.id === user?.id && (
                        <Badge variant="outline" className="text-slate-500 border-slate-700 h-5 px-1.5 text-[10px]">Você</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{member.whatsapp_number || "Sem WhatsApp"}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Saldo Atual</p>
                  <p className={`font-bold ${member.balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatCurrency(member.balance)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
