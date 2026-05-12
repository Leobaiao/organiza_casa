"use client";

import { useState } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AddBillDialog({ members }: { members: any[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(async (_: any, fd: FormData) => createBill(fd), null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="bg-indigo-600 hover:bg-indigo-500 text-white" />}
      >
        <Plus className="mr-2 h-4 w-4" /> Nova Conta
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Conta</DialogTitle>
          <DialogDescription className="text-slate-400">
            Adicione uma conta e o sistema dividirá o valor automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Conta</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Ex: Aluguel, Internet..." 
                required 
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
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" defaultValue="fixed">
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="fixed">Fixa</SelectItem>
                    <SelectItem value="variable">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input 
                id="dueDate" 
                name="dueDate" 
                type="date" 
                required 
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div className="space-y-3">
              <Label>Participantes do Rateio</Label>
              <ScrollArea className="h-[120px] rounded-md border border-slate-800 p-2 bg-slate-950/50">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`member-${member.id}`} 
                        name="participants" 
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
