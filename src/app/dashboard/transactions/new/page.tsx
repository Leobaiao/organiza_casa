import { getUser, getProfile } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { registerPayment } from "@/app/actions/transactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewTransactionPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.household_id) redirect("/onboarding");

  return (
    <div className="max-w-md mx-auto space-y-6 py-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Novo Pagamento</h1>
      </div>

      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Wallet className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Registrar</span>
          </div>
          <CardTitle className="text-white">Detalhes do Pagamento</CardTitle>
          <CardDescription className="text-slate-400">
            Informe o valor que você pagou para a casa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (fd) => { "use server"; await registerPayment(fd); }} className="space-y-4">
            <input type="hidden" name="householdId" value={profile.household_id} />
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-300">Valor (R$)</Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                placeholder="0,00" 
                required 
                className="bg-slate-950 border-slate-800 text-white text-lg py-6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Descrição</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Ex: Paguei a internet" 
                required 
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 text-lg font-bold mt-4"
            >
              Confirmar Pagamento
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
