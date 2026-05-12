import { getUser, getProfile } from "@/lib/supabase/user";
import { getHouseholdMembers } from "@/lib/supabase/members";
import { redirect } from "next/navigation";
import { createBill } from "@/app/actions/bills";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewBillPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.household_id) redirect("/onboarding");

  const members = await getHouseholdMembers(profile.household_id);

  return (
    <div className="max-w-md mx-auto space-y-6 py-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nova Conta</h1>
      </div>

      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Receipt className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Cadastrar</span>
          </div>
          <CardTitle className="text-white">Detalhes da Despesa</CardTitle>
          <CardDescription className="text-slate-400">
            Adicione uma conta para dividir com os membros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createBill} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Nome da Conta</Label>
              <Input id="name" name="name" placeholder="Ex: Aluguel, Luz, Internet" required className="bg-slate-950 border-slate-800 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-300">Valor Total</Label>
                <Input id="amount" name="amount" type="number" step="0.01" placeholder="0,00" required className="bg-slate-950 border-slate-800 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-slate-300">Vencimento</Label>
                <Input id="dueDate" name="dueDate" type="date" required className="bg-slate-950 border-slate-800 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-slate-300">Tipo</Label>
              <select name="type" id="type" className="w-full bg-slate-950 border border-slate-800 text-white rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="fixed">Fixa (Mensal)</option>
                <option value="variable">Variável (Única)</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-300">Dividir com:</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-slate-800 rounded-lg bg-slate-950/50">
                {members.map((member) => (
                  <label key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-md cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="participants" 
                      value={member.id} 
                      defaultChecked 
                      className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-300">{member.full_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 text-lg font-bold mt-2">
              Cadastrar Conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
