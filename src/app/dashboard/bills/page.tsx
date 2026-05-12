import { getUser, getProfile } from "@/lib/supabase/user";
import { getBills } from "@/lib/supabase/bills";
import { getTransactions } from "@/lib/supabase/transactions";
import { getHouseholdMembers } from "@/lib/supabase/members";
import { redirect } from "next/navigation";
import { AddBillDialog } from "@/components/dashboard/add-bill-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { BillCard } from "@/components/dashboard/bill-card";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile || !profile.household_id) {
    redirect("/onboarding");
  }

  const [bills, members, allTransactions] = await Promise.all([
    getBills(profile.household_id),
    getHouseholdMembers(profile.household_id),
    getTransactions(profile.household_id)
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Contas</h1>
          <p className="text-slate-400">Gerencie e acompanhe o pagamento das despesas da casa.</p>
        </div>
        <AddBillDialog members={members} />
      </div>

      <div className="grid gap-6">
        {bills.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bills.map((bill: any) => (
              <BillCard 
                key={bill.id} 
                bill={bill} 
                members={members} 
                allTransactions={allTransactions} 
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-slate-800 bg-transparent py-20">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
                <Receipt className="h-10 w-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-semibold text-white">Nenhuma conta cadastrada</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                Comece adicionando uma despesa como aluguel ou luz para gerenciar o rateio automático entre os moradores.
              </p>
              <div className="mt-8">
                <AddBillDialog members={members} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
