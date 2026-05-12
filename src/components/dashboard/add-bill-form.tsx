"use client";

import { useState, useEffect, useActionState } from "react";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Receipt, Check, Loader2, Calendar as CalendarIcon, FileText, Scan } from "lucide-react";
import { createBill } from "@/app/actions/bills";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

export function AddBillForm({ members }: { members: any[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(async (_: any, fd: FormData) => createBill(fd), null);
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    type: "fixed"
  });
  
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/dashboard/bills");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    
    // Simulate OCR delay
    setTimeout(() => {
      // Mock data extraction logic
      // In a real app, this would use a service like AWS Textract or a PDF library
      setFormData({
        ...formData,
        name: file.name.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' '),
        amount: (Math.random() * 500 + 50).toFixed(2),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setIsScanning(false);
    }, 1500);
  };

  return (
    <CardContent className="relative">
      {state?.success && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm animate-in fade-in zoom-in duration-300 rounded-2xl p-6 text-center">
          <div className="h-20 w-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 animate-bounce">
            <Check className="h-10 w-10 text-indigo-400 stroke-[3px]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Conta Cadastrada!</h3>
          <p className="text-slate-400 text-sm">
            A despesa foi adicionada e rateada. Redirecionando...
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 border-dashed relative overflow-hidden group">
            <input 
              type="file" 
              id="pdf-scan" 
              accept="application/pdf,image/*" 
              className="hidden" 
              onChange={handleScan}
            />
            <label 
              htmlFor="pdf-scan"
              className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                  <p className="text-sm font-medium text-slate-300">Lendo boleto...</p>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Scan className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Escanear Boleto (PDF/Foto)</p>
                    <p className="text-xs text-slate-500">Extração automática de valor e vencimento</p>
                  </div>
                </>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Nome da Conta</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Ex: Aluguel, Luz, Internet" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-300">Valor Total</Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                placeholder="0,00" 
                required 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-slate-300">Vencimento</Label>
              <Input 
                id="dueDate" 
                name="dueDate" 
                type="date" 
                required 
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-slate-300">Tipo</Label>
            <select 
              id="type" 
              name="type" 
              className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="fixed">Fixa (Mensal)</option>
              <option value="variable">Variável</option>
              <option value="extra">Extraordinária</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-300">Dividir com:</Label>
            <div className="grid gap-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id={`member-${member.id}`}
                    name="memberIds"
                    value={member.id}
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={`member-${member.id}`} className="text-sm font-medium text-slate-300 cursor-pointer">
                    {member.full_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isPending || !!state?.success}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98]"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Cadastrar Conta"}
        </Button>
      </form>
    </CardContent>
  );
}
