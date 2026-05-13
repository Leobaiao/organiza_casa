"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Receipt, Calendar, Upload, X } from "lucide-react";
import { payAllUserDebts, getUserDebts } from "@/app/actions/bills";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

interface PayAllButtonProps {
  balance: number;
}

export function PayAllButton({ balance }: PayAllButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [debts, setDebts] = useState<any[]>([]);
  const [isLoadingDebts, setIsLoadingDebts] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoadingDebts(true);
      getUserDebts().then(data => {
        setDebts(data || []);
        setIsLoadingDebts(false);
      });
    }
  }, [isOpen]);

  const handlePayAll = () => {
    startTransition(async () => {
      // In a real app, we would upload the file here first
      await payAllUserDebts();
      setIsOpen(false);
    });
  };

  if (balance >= 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button 
          size="sm"
          className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider h-7"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Quitar Tudo
        </Button>
      } />
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-400" />
            Pagar Pendências
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Revise as contas que serão quitadas e anexe o comprovante.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total a Pagar</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(Math.abs(balance))}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Contas</p>
                <p className="text-lg font-semibold">{debts.length}</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingDebts ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                </div>
              ) : (
                debts.map(debt => (
                  <div key={debt.id} className="flex justify-between items-center text-sm py-1 border-b border-slate-800/50 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{debt.name}</span>
                      <span className="text-[10px] text-slate-500 italic">Vence em {new Date(debt.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="font-mono text-slate-300">{formatCurrency(Math.abs(debt.amount))}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Comprovante</p>
            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/30 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-sm text-slate-500 group-hover:text-slate-400">Clique para anexar o comprovante</p>
                  <p className="text-xs text-slate-600 mt-1">PNG, JPG ou PDF</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf" 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white truncate max-w-[200px]">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setSelectedFile(null)}
                  className="h-8 w-8 text-slate-500 hover:text-rose-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="flex-1 border-slate-800"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handlePayAll}
            disabled={isPending || !selectedFile}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
