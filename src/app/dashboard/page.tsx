import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Receipt, TrendingUp, ArrowUpRight, Plus, Calendar, DollarSign, CheckCircle2, Home, Zap, Droplet, Wifi, ShoppingCart, Wrench } from "lucide-react";
import { getUser, getProfile } from "@/lib/supabase/user";
import { getDashboardStats } from "@/lib/supabase/stats";
import { getHouseholdMembers } from "@/lib/supabase/members";
import { getTransactions } from "@/lib/supabase/transactions";
import { getBills } from "@/lib/supabase/bills";
import { redirect } from "next/navigation";
import { CopyButton } from "@/components/dashboard/copy-button";
import { getUserDebts } from "@/app/actions/bills";
import { QuickPaymentDialog } from "@/components/dashboard/quick-payment-dialog";
import { AddBillDialog } from "@/components/dashboard/add-bill-dialog";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { StatsCharts } from "@/components/dashboard/stats-charts";
import { PayAllButton } from "@/components/dashboard/pay-all-button";
import { PayBillButton } from "@/components/dashboard/pay-bill-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const getCategoryIcon = (category: string, sizeClass: string = "h-5 w-5") => {
  switch (category) {
    case 'rent': return <Home className={`${sizeClass} text-indigo-400`} />;
    case 'electricity': return <Zap className={`${sizeClass} text-yellow-400`} />;
    case 'water': return <Droplet className={`${sizeClass} text-blue-400`} />;
    case 'internet': return <Wifi className={`${sizeClass} text-emerald-400`} />;
    case 'supermarket': return <ShoppingCart className={`${sizeClass} text-orange-400`} />;
    case 'maintenance': return <Wrench className={`${sizeClass} text-slate-400`} />;
    default: return <Receipt className={`${sizeClass} text-slate-400`} />;
  }
};

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  
  // If no profile or no household, redirect to onboarding
  if (!profile || !profile.household_id) {
    redirect("/onboarding");
  }

  const [stats, members, transactions, bills, debts] = await Promise.all([
    getDashboardStats(user.id, profile.household_id),
    getHouseholdMembers(profile.household_id),
    getTransactions(profile.household_id),
    getBills(profile.household_id),
    getUserDebts()
  ]);

  const pixKey = profile.households?.pix_key || "Chave não cadastrada";

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
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Bem-vindo de volta, {profile.full_name?.split(' ')[0] || "Morador"}!</p>
        </div>
        <div className="flex items-center gap-3">
          <CopyButton text={profile.household_id} />
          {profile.role === 'admin' && (
            <div className="hidden md:block">
              <AddBillDialog members={members} trigger={
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 h-10">
                  <Plus className="h-4 w-4" /> Nova Conta
                </Button>
              } />
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickPaymentDialog 
          householdId={profile.household_id} 
          pixKey={pixKey} 
          debts={debts || []} 
        />
        
        {profile.role === 'admin' && (
          <div className="md:hidden">
            <AddBillDialog members={members} trigger={
              <button className="w-full text-left h-24 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between hover:border-indigo-500/50 transition-all cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="font-bold text-white">Nova Conta</p>
              </button>
            } />
          </div>
        )}

        <Link href="/dashboard/members" className="hidden md:flex">
          {/* Desktop only members shortcut */}
          <div className="h-24 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between hover:border-indigo-500/50 transition-all w-full">
            <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="font-bold text-white">Membros</p>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Seu Saldo" 
          value={formatCurrency(stats.personalBalance)} 
          description={stats.personalBalance >= 0 ? "Você está no azul!" : "Pendente de pagamento"}
          icon={<Wallet className="h-5 w-5 text-emerald-400" />}
          trend={stats.personalBalance >= 0 ? "positive" : "negative"}
          footer={<PayAllButton balance={stats.personalBalance} />}
        />
        <StatCard 
          title="Total da Casa" 
          value={formatCurrency(stats.householdTotal)} 
          description="Gastos totais do mês"
          icon={<Receipt className="h-5 w-5 text-indigo-400" />}
        />
        <StatCard 
          title="Próximo Vencimento" 
          value={stats.upcomingBills[0]?.name || "Nenhuma"} 
          description={stats.upcomingBills[0] ? `Vence em ${new Date(stats.upcomingBills[0].due_date).toLocaleDateString('pt-BR')}` : "Tudo em dia!"}
          icon={<Calendar className="h-5 w-5 text-cyan-400" />}
        />
      </div>
      
      {/* Visual Analytics */}
      <StatsCharts bills={bills} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Bills List */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Próximas Contas</CardTitle>
              <CardDescription className="text-slate-400">Contas a vencer nos próximos dias.</CardDescription>
            </div>
            <Link href="/dashboard/bills">
              <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">Ver todas</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingBills.length > 0 ? (
                stats.upcomingBills.map((bill: any) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:border-slate-700 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner group-hover:border-slate-700 transition-all">
                        {getCategoryIcon(bill.category || 'other')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{bill.name}</p>
                        <p className="text-xs text-slate-500">{new Date(bill.due_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-white">{formatCurrency(bill.total_amount)}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{bill.type === 'fixed' ? 'Fixa' : 'Variável'}</p>
                      </div>
                      <div className="border-l border-slate-800 pl-3 min-w-[100px] flex justify-end">
                        {bill.userHasPaid ? (
                          <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase">
                            <CheckCircle2 className="h-3 w-3" />
                            Pago
                          </div>
                        ) : (
                          <PayBillButton 
                            billId={bill.id} 
                            billName={bill.name} 
                            amount={bill.userShare} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-slate-600" />
                  </div>
                  <p className="text-slate-500">Nenhuma conta pendente para os próximos dias.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Activity */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Atividade Recente</CardTitle>
            <CardDescription className="text-slate-400">Últimas movimentações da casa.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">Sem atividades registradas ainda.</p>
                </div>
              ) : (
                transactions.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.amount > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {activity.amount > 0 ? <Plus className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{activity.description}</p>
                        <p className="text-xs text-slate-500">{activity.profiles?.full_name}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${activity.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {(profile.role === 'admin' || activity.user_id === user.id) 
                        ? `${activity.amount > 0 ? "+" : ""}${formatCurrency(activity.amount)}` 
                        : "---"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon, trend, footer }: { 
  title: string, 
  value: string, 
  description: string, 
  icon: React.ReactNode,
  trend?: "positive" | "negative",
  footer?: React.ReactNode
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden relative group transition-all hover:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          {description}
          {trend && (
            <ArrowUpRight className={`h-3 w-3 ${trend === "positive" ? "text-emerald-400" : "text-rose-400"}`} />
          )}
        </p>
        {footer}
      </CardContent>
      <div className="absolute -right-2 -bottom-2 h-16 w-16 rounded-full bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all" />
    </Card>
  );
}
