import { getUser, getProfile } from "@/lib/supabase/user";
import { getBills } from "@/lib/supabase/bills";
import { getTransactions } from "@/lib/supabase/transactions";
import { getHouseholdMembers } from "@/lib/supabase/members";
import { redirect } from "next/navigation";
import { AddBillDialog } from "@/components/dashboard/add-bill-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { BillCard } from "@/components/dashboard/bill-card";
import { BillsView } from "@/components/dashboard/bills-view";

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
        {profile.role === 'admin' && <AddBillDialog members={members} />}
      </div>

      <BillsView 
        bills={bills} 
        members={members} 
        allTransactions={allTransactions} 
        currentUserId={user.id}
        currentUserRole={profile.role}
      />
    </div>
  );
}
