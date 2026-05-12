"use client";

import { useState, useEffect, useActionState } from "react";
import { registerPayment } from "@/app/actions/transactions";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Send, Wand2 } from "lucide-react";

interface SharePreviewFormProps {
  url: string;
  householdId: string;
  pixKey?: string;
}

export function SharePreviewForm({ url, householdId, pixKey }: SharePreviewFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(async (_: any, fd: FormData) => registerPayment(fd), null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Pagamento compartilhado");

  useEffect(() => {
    // Simulate OCR analysis when page loads
    const timer = setTimeout(() => {
      // Mock extraction: Random value between 50 and 300
      setAmount((Math.random() * 250 + 50).toFixed(2));
      setDescription(`Pagamento via Banco - ${new Date().toLocaleDateString('pt-BR')}`);
      setIsAnalyzing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard?message=Pagamento registrado com sucesso!");
    }
  }, [state, router]);

  return (
    <CardContent className="p-6 space-y-6">
      {isAnalyzing ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <Wand2 className="absolute inset-0 m-auto h-5 w-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <p className="text-white font-medium">Analisando comprovante...</p>
            <p className="text-xs text-slate-500 mt-1">Extraindo valor e data via IA</p>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <input type="hidden" name="householdId" value={householdId} />
          <input type="hidden" name="receiptUrl" value={url} />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-300 flex items-center justify-between">
                Valor Identificado
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" /> IA
                </span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-950 border-slate-800 h-14 pl-10 text-xl font-bold text-white focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Descrição</Label>
              <Input 
                id="description" 
                name="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white h-12"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 border-slate-800 text-slate-400"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Confirmar
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </CardContent>
  );
}

// Helper to wrap CardContent if needed by parent
function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={className}>{children}</div>;
}
