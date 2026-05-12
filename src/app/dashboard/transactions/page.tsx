import { getUser, getProfile } from "@/lib/supabase/user";
import { getTransactions } from "@/lib/supabase/transactions";
import { redirect } from "next/navigation";
import { 
  Search, 
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/dashboard/transaction-list";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.household_id) redirect("/onboarding");

  const transactions = await getTransactions(profile.household_id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Extrato</h1>
          <p className="text-slate-400">Acompanhe detalhadamente as movimentações financeiras da casa.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10 bg-slate-900 border-slate-800 text-white w-full md:w-48"
            />
          </div>
          <Button variant="outline" className="border-slate-800 bg-slate-900 hover:bg-slate-800">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TransactionList transactions={transactions} />
    </div>
  );
}
