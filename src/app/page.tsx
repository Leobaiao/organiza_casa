import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Wallet, Receipt, Users, Calculator } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-slate-800 bg-slate-950 py-16">
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Organiza <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Casa</span>
            </h1>
            <p className="mb-8 text-lg text-slate-400">
              Gestão inteligente de contas domésticas com modelo de saldo corrente e automação via WhatsApp.
            </p>
            <div className="flex gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500">
                  Dashboard Admin <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-slate-700 bg-slate-900/50 hover:bg-slate-800">
                  Entrar como Membro
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Abstract Background Element */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard 
            icon={<Wallet className="h-6 w-6 text-indigo-400" />}
            title="Saldo Corrente"
            description="Lógica de débitos e créditos. O saldo final é o que importa, sem amarras a contas específicas."
          />
          <FeatureCard 
            icon={<Calculator className="h-6 w-6 text-cyan-400" />}
            title="Previsão Inteligente"
            description="Cálculo automático de gastos para o próximo mês com margem de segurança de 10%."
          />
          <FeatureCard 
            icon={<Receipt className="h-6 w-6 text-emerald-400" />}
            title="Comprovantes via Zap"
            description="Envie o print do comprovante pelo WhatsApp e o sistema identifica e credita automaticamente."
          />
          <FeatureCard 
            icon={<Users className="h-6 w-6 text-rose-400" />}
            title="Gestão de Rateio"
            description="Divida contas fixas ou variáveis apenas entre quem realmente participa."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-slate-800 bg-slate-900/50 transition-colors hover:border-slate-700">
      <CardHeader>
        <div className="mb-2 w-fit rounded-lg bg-slate-800 p-2">
          {icon}
        </div>
        <CardTitle className="text-xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-slate-400">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
