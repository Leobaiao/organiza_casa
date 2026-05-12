"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { registerPayment } from "@/app/actions/transactions";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign } from "lucide-react";

export function AddTransactionDialog({ householdId }: { householdId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(registerPayment, null);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800" />}
      >
        Registrar Pagamento
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription className="text-slate-400">
            Informe o valor que você está pagando para a casa. Isso abaterá seu saldo devedor.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-6 pt-4">
          <input type="hidden" name="householdId" value={householdId} />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor Pago (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00" 
                  required 
                  className="bg-slate-950 border-slate-800 pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Ex: Pix do aluguel, luz..." 
                className="bg-slate-950 border-slate-800"
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
