import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Organiza <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Casa</span>
          </h1>
          <p className="text-slate-400">Gerencie seu lar de forma inteligente</p>
        </div>
        {children}
      </div>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>
    </div>
  );
}
