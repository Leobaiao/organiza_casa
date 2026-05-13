"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, AlertTriangle } from "lucide-react";
import { leaveHousehold } from "@/app/actions/household";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function LeaveHouseButton() {
  const [isPending, startTransition] = useTransition();

  const handleLeave = () => {
    startTransition(async () => {
      await leaveHousehold();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button 
          variant="outline" 
          className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair desta Casa
        </Button>
      } />
      <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-400">
            Ao sair desta casa, você não terá mais acesso às contas, rateios e histórico de transações. 
            Seu saldo devedor permanecerá registrado para os outros membros.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLeave}
            disabled={isPending}
            className="bg-rose-600 hover:bg-rose-500 text-white"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
            Confirmar Saída
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
