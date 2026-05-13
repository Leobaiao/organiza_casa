"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { createBill } from "@/app/actions/bills";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2, Check, Scan } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AddBillDialog({ members, trigger }: { members: any[], trigger?: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(async (_: any, fd: FormData) => createBill(fd), null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    type: "fixed"
  });

  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    
    // Simulate OCR delay
    setTimeout(() => {
      setFormData({
        ...formData,
        name: file.name.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' '),
        amount: (Math.random() * 500 + 50).toFixed(2),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setIsScanning(false);
    }, 1500);
  };
  
  useEffect(() => {
    if (state?.success) {
      setIsSuccess(true);
      const timer = setTimeout(() => {
        setOpen(false);
        setFormData({ name: "", amount: "", dueDate: "", type: "fixed" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state?.success]);

  useEffect(() => {
    if (!open) {
      setIsSuccess(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(trigger || (
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 px-4">
            <Plus className="mr-2 h-4 w-4" /> Nova Conta
          </Button>
        )) as React.ReactElement}
      />
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        {isSuccess && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm animate-in fade-in zoom-in duration-300 p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 animate-bounce">
              <Check className="h-8 w-8 text-indigo-400 stroke-[3px]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Conta Cadastrada!</h3>
            <p className="text-slate-400 text-xs">
              A despesa foi adicionada e rateada com sucesso.
            </p>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Conta</DialogTitle>
          <DialogDescription className="text-slate-400">
            Adicione uma conta e o sistema dividirá o valor automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-6 pt-4">
          <div className="space-y-4">
            
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 border-dashed relative overflow-hidden group">
              <input 
                type="file" 
                id="pdf-scan-modal" 
                accept="application/pdf,image/*" 
                className="hidden" 
                onChange={handleScan}
              />
              <label 
                htmlFor="pdf-scan-modal"
                className="flex flex-col items-center justify-center gap-2 cursor-pointer py-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                    <p className="text-sm font-medium text-slate-300">Lendo boleto...</p>
                  </>
                ) : (
                  <>
                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Scan className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">Escanear Boleto</p>
                    </div>
                  </>
                )}
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome da Conta</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Ex: Aluguel, Internet..." 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-950 border-slate-800"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor Total (R$)</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00" 
                  required 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Vencimento</Label>
                <Input 
                  id="dueDate" 
                  name="dueDate" 
                  type="date" 
                  required 
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" value={formData.type} onValueChange={(val) => setFormData({...formData, type: val ?? "fixed"})}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="fixed">Fixa</SelectItem>
                    <SelectItem value="variable">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select name="category" defaultValue="other">
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="other">🧾 Outros</SelectItem>
                    <SelectItem value="rent">🏠 Aluguel</SelectItem>
                    <SelectItem value="electricity">⚡ Energia</SelectItem>
                    <SelectItem value="water">💧 Água</SelectItem>
                    <SelectItem value="internet">🌐 Internet</SelectItem>
                    <SelectItem value="supermarket">🛒 Mercado</SelectItem>
                    <SelectItem value="maintenance">🔧 Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Participantes do Rateio</Label>
              <ScrollArea className="h-[120px] rounded-md border border-slate-800 p-2 bg-slate-950/50">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`member-${member.id}`} 
                        name="memberIds" 
                        value={member.id} 
                        defaultChecked
                        className="border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <label
                        htmlFor={`member-${member.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                      >
                        {member.full_name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-[10px] text-slate-500 italic">* O valor será dividido igualmente entre os selecionados.</p>
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cadastrar Conta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
