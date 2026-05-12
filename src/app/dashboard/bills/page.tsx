import { getUser, getProfile } from "@/lib/supabase/user";
import { getBills } from "@/lib/supabase/bills";
import { deleteBill } from "@/app/actions/bills";
import { getHouseholdMembers } from "@/lib/supabase/members";
import { redirect } from "next/navigation";
import { AddBillDialog } from "@/components/dashboard/add-bill-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BillsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile || !profile.household_id) {
    redirect("/onboarding");
  }

  const bills = await getBills(profile.household_id);
  const members = await getHouseholdMembers(profile.household_id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Contas</h1>
          <p className="text-slate-400">Gerencie as despesas fixas e variáveis da casa.</p>
        </div>
        <AddBillDialog members={members} />
      </div>

      <div className="grid gap-6">
        {bills.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bills.map((bill: any) => (
              <Card key={bill.id} className="border-slate-800 bg-slate-900/50 backdrop-blur-xl group hover:border-slate-700 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={bill.type === "fixed" ? "secondary" : "outline"} className={bill.type === "fixed" ? "bg-indigo-500/10 text-indigo-400 border-none" : "text-cyan-400 border-cyan-500/20"}>
                      {bill.type === "fixed" ? "Fixa" : "Variável"}
                    </Badge>
                    <form action={async () => {
                      "use server";
                      await deleteBill(bill.id);
                    }}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-rose-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                  <CardTitle className="text-white text-xl">{bill.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(bill.total_amount)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>Vence em {new Date(bill.due_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <User className="h-4 w-4" />
                      <span>{bill.participants?.length || 0} participantes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-slate-800 bg-transparent py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold text-white">Nenhuma conta cadastrada</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                Comece adicionando uma conta como aluguel, luz ou internet para gerenciar o rateio.
              </p>
              <div className="mt-6">
                <AddBillDialog members={members} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
