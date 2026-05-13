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

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const { q } = await searchParams;
  const profile = await getProfile(user.id);
  if (!profile?.household_id) redirect("/onboarding");

  const transactions = await getTransactions(profile.household_id);

  // 1. Role Filter: Members see only their own, Admins see all
  const filteredByRole = profile.role === 'admin' 
    ? transactions 
    : transactions.filter((t: any) => t.user_id === user.id);

  // 2. Search Filter (Initial server-side filter, but client-side will also handle it)
  const searchTerm = q || "";
  const filteredTransactions = filteredByRole.filter((t: any) => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.profiles?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <TransactionList transactions={filteredTransactions} />
    </div>
  );
}
