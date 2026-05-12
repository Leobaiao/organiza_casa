import { getUser } from "@/lib/supabase/user";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { QuickPaymentForm } from "@/components/dashboard/quick-payment-form";

export default async function QuickPaymentPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  // Get profile and household info
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*, households(*)")
    .eq("id", user.id)
    .single();

  if (!profile?.household_id) redirect("/onboarding");

  // In a real app, this would come from household settings
  const pixKey = "pix@organizacasa.com";

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-4 px-4 overflow-x-hidden">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex items-center justify-between py-2">
          <Link href="/dashboard" className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
            &larr;
          </Link>
          <h1 className="text-sm font-black text-white uppercase tracking-[0.3em]">Quick Pay</h1>
          <div className="w-10"></div>
        </header>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden relative border-t-emerald-500/50 border-t-2">
          <QuickPaymentForm 
            householdId={profile.household_id} 
            pixKey={pixKey} 
          />
        </Card>

        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-5 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
            Sua transação ficará pendente de aprovação.<br/> 
            Mantenha o comprovante em mãos.
          </p>
        </div>
      </div>
    </div>
  );
}
