import { getUser, getProfile } from "@/lib/supabase/user";
import { getTransactions } from "@/lib/supabase/transactions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  Filter,
  Calendar as CalendarIcon,
  User as UserIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.household_id) redirect("/onboarding");

  const transactions = await getTransactions(profile.household_id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Transações</h1>
          <p className="text-slate-400">Histórico completo de pagamentos e movimentações da casa.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Buscar transação..." 
              className="pl-10 bg-slate-900 border-slate-800 text-white w-full md:w-64"
            />
          </div>
          <Button variant="outline" className="border-slate-800 bg-slate-900 hover:bg-slate-800">
            <Filter className="h-4 w-4 mr-2" /> Filtrar
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-400" />
              Movimentações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium">Membro</th>
                    <th className="px-6 py-4 font-medium">Descrição</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Nenhuma transação registrada ainda.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-slate-300">{formatDate(t.created_at)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-slate-500" />
                            </div>
                            <span className="text-sm font-medium text-white">
                              {t.profiles?.full_name || "Desconhecido"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-300">{t.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-none capitalize">
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {t.amount > 0 ? (
                              <ArrowUpCircle className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <ArrowDownCircle className="h-4 w-4 text-rose-400" />
                            )}
                            <span className={`text-sm font-bold ${t.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {formatCurrency(t.amount)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
