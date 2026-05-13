"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign } from "lucide-react";
import { payBill } from "@/app/actions/bills";

interface PayBillButtonProps {
  billId: string;
  billName: string;
  amount: number;
}

export function PayBillButton({ billId, billName, amount }: PayBillButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handlePay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Deseja pagar sua parte de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)} na conta "${billName}"?`)) {
      startTransition(async () => {
        await payBill(billId, "me", amount, billName); 
        // "me" is a placeholder, the action should handle getting the current user if we want
      });
    }
  };

  return (
    <Button 
      onClick={handlePay}
      disabled={isPending || amount <= 0}
      size="sm"
      variant="ghost"
      className="h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 px-2"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          <span className="text-xs font-bold uppercase">Pagar Parte</span>
        </div>
      )}
    </Button>
  );
}
