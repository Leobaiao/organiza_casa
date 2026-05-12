"use client";

import { useState } from "react";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Send, Copy, CheckCircle2, Check, Loader2, FileText, Camera, Paperclip } from "lucide-react";
import { registerPayment } from "@/app/actions/transactions";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

export function QuickPaymentForm({ householdId, pixKey }: { householdId: string, pixKey: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(async (_: any, fd: FormData) => registerPayment(fd), null);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state?.success) {
      // Small delay to let user see the success state before redirecting
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <DollarSign className="text-emerald-400 h-5 w-5" />
          Transferir para a Casa
        </CardTitle>
        <CardDescription className="text-slate-400">
          Registre o pagamento feito para o administrador da casa.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {state?.success && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm animate-in fade-in zoom-in duration-300 rounded-2xl p-6 text-center">
            <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 animate-bounce">
              <Check className="h-10 w-10 text-emerald-400 stroke-[3px]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pagamento Registrado!</h3>
            <p className="text-slate-400 text-sm">
              Sua transação foi enviada para aprovação. Redirecionando...
            </p>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="householdId" value={householdId} />
          
          <div className="space-y-4">
            <Label className="text-slate-300 font-medium text-xs uppercase tracking-wider">Sugestões de Valor</Label>
            <div className="grid grid-cols-3 gap-3">
              {[50, 100, 200].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`py-3 rounded-xl border transition-all active:scale-95 font-bold ${
                    amount === val.toString() 
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}
                  onClick={() => setAmount(val.toString())}
                >
                  R$ {val}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-300">Valor do Pagamento</Label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">R$</span>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00" 
                  required 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-950 border-slate-800 h-16 pl-12 text-2xl font-bold text-white focus:ring-emerald-500 focus:border-emerald-500 transition-all rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Descrição</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Ex: Pix do mês, luz..." 
                className="bg-slate-950 border-slate-800 text-white h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Anexar Comprovante (Opcional)</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input 
                    id="receipt" 
                    name="receipt" 
                    type="file" 
                    accept="image/*,application/pdf"
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const label = document.getElementById('file-label');
                        if (label) label.innerText = file.name;
                      }
                    }}
                  />
                  <label 
                    htmlFor="receipt"
                    id="file-label"
                    className="flex items-center gap-2 px-4 h-12 bg-slate-950 border border-slate-800 border-dashed rounded-xl text-sm text-slate-500 hover:border-emerald-500/50 hover:text-slate-300 cursor-pointer transition-all truncate"
                  >
                    <Paperclip className="h-4 w-4 shrink-0" />
                    Selecionar Comprovante...
                  </label>
                </div>
                <Button type="button" variant="outline" className="h-12 border-slate-800 bg-slate-950 text-slate-400 gap-2">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-slate-500 italic">Formatos: JPG, PNG ou PDF.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Chave PIX da Casa</span>
              <span className="text-[10px] text-slate-500 font-medium">Copia e Cola</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 flex-1 overflow-hidden">
                <code className="text-sm text-slate-300 block truncate font-mono">
                  {pixKey}
                </code>
              </div>
              <Button 
                type="button" 
                variant="outline"
                size="icon" 
                className={`h-12 w-12 rounded-xl transition-all ${
                  copied ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
                onClick={copyPix}
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isPending || !!state?.success}
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-emerald-900/20 transition-all hover:translate-y-[-2px] active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                Confirmar Pagamento
                <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </>
  );
}
