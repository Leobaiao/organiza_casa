import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { getUser, getProfile } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
 
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.household_id) redirect("/onboarding");

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <Sidebar className="hidden lg:flex w-64 border-r border-slate-800" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav profile={profile} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileNav />
      
      {/* Background glow effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>
    </div>
  );
}
