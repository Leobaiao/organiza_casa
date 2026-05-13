"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { QuickPaymentForm } from "./quick-payment-form";
import { DollarSign, ArrowUpRight } from "lucide-react";

interface QuickPaymentDialogProps {
  householdId: string;
  pixKey: string;
  debts: any[];
}

export function QuickPaymentDialog({ householdId, pixKey, debts }: QuickPaymentDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="col-span-2 relative overflow-hidden group h-24 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <DollarSign className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
              </div>
              <p className="font-bold text-white text-lg text-left">Pagar Agora (Pix)</p>
            </div>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all" />
          </button>
        }
      />
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Quick Pay</DialogTitle>
          <DialogDescription className="text-slate-400">
            Transfira para a casa e anexe o comprovante.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <QuickPaymentForm 
            householdId={householdId} 
            pixKey={pixKey} 
            debts={debts}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
