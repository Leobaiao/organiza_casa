import { getUser, getProfile } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { createHousehold, joinHousehold } from "@/app/actions/household";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, UserPlus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string, invite?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  const params = await searchParams;
  const mode = params?.mode;
  const inviteId = params?.invite;

  // 1. If user already has a house AND there's no new invite, go to dashboard
  if (profile?.household_id && !inviteId) {
    redirect("/dashboard");
  }

  // 2. Invite screen (if invite ID is present) - Even if they have a house, show the invite
  if (inviteId && !mode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-indigo-500/30 bg-slate-900/50 backdrop-blur-xl border-2 shadow-2xl shadow-indigo-500/10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
              <UserPlus className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl text-white font-bold">Você foi convidado!</CardTitle>
            <CardDescription className="text-slate-400 text-base mt-2">
              Alguém te convidou para participar de uma casa no Organiza Casa.
            </CardDescription>
          </CardHeader>
          <form action={async (fd) => {
            "use server";
            await joinHousehold(fd);
          }}>
            <input type="hidden" name="householdId" value={inviteId} />
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">ID da Casa</p>
                <p className="text-sm font-mono text-indigo-300 break-all">{inviteId}</p>
              </div>

              {profile?.household_id && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-rose-400 text-xs font-bold">!</span>
                  </div>
                  <p className="text-xs text-rose-300 leading-relaxed">
                    <span className="font-bold">Aviso:</span> Você já faz parte de uma casa. Ao aceitar este convite, você <span className="underline">sairá automaticamente</span> da casa atual para entrar nesta nova.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 text-lg shadow-lg shadow-indigo-500/20 transition-all"
              >
                {profile?.household_id ? "Trocar de Casa" : "Aceitar e Entrar na Casa"}
              </Button>
              <Link href={profile?.household_id ? "/dashboard" : "/onboarding"} className="text-sm text-slate-500 hover:text-white transition-colors">
                {profile?.household_id ? "Manter casa atual" : "Recusar e criar minha própria casa"}
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Choice screen (default)
  if (!mode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Bem-vindo ao seu novo lar digital</h1>
          <p className="text-slate-400 text-lg">Escolha como você deseja começar a organizar sua casa.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          <Link 
            href="/onboarding?mode=create"
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-left transition-all hover:border-indigo-500/50 hover:bg-slate-900"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Criar uma nova casa</h3>
            <p className="text-slate-400">Inicie um novo grupo doméstico e convide membros para dividir as contas.</p>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl transition-all group-hover:bg-indigo-500/10" />
          </Link>

          <Link 
            href="/onboarding?mode=join"
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-left transition-all hover:border-cyan-500/50 hover:bg-slate-900"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Entrar em uma casa</h3>
            <p className="text-slate-400">Já tem um grupo? Peça o ID da casa para o administrador e comece a participar.</p>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl transition-all group-hover:bg-cyan-500/10" />
          </Link>
        </div>
      </div>
    );
  }

  // Create or Join form
  const isCreate = mode === "create";
  const formAction = isCreate ? createHousehold : joinHousehold;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/onboarding" className="text-slate-400 hover:text-white text-sm">
              &larr; Voltar
            </Link>
          </div>
          <CardTitle className="text-2xl text-white">
            {isCreate ? "Criar Minha Casa" : "Entrar em uma Casa"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {isCreate
              ? "Dê um nome para o seu lar e comece a organizar as finanças." 
              : "Insira o ID único da casa que você deseja participar."}
          </CardDescription>
        </CardHeader>
        <form action={async (fd) => {
          "use server";
          if (isCreate) {
            await createHousehold(fd);
          } else {
            await joinHousehold(fd);
          }
        }}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={isCreate ? "name" : "householdId"} className="text-slate-300">
                {isCreate ? "Nome da Casa" : "ID da Casa"}
              </Label>
              <Input 
                id={isCreate ? "name" : "householdId"} 
                name={isCreate ? "name" : "householdId"} 
                placeholder={isCreate ? "Ex: Nossa Mansão" : "Cole o UUID da casa aqui"} 
                required 
                className="bg-slate-950 border-slate-800 text-white focus:ring-indigo-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              className={`w-full ${isCreate ? "bg-indigo-600 hover:bg-indigo-500" : "bg-cyan-600 hover:bg-cyan-500"} text-white transition-all`}
            >
              {isCreate ? "Criar Agora" : "Entrar na Casa"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
