"use client";

import { useState, useActionState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, User, Trash2, Edit2, CheckCircle2, Circle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { deleteBill, updateBill } from "@/app/actions/bills";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BillCardProps {
  bill: any;
  members: any[];
  allTransactions: any[];
}

export function BillCard({ bill, members, allTransactions }: BillCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [deleteState, deleteAction, isDeleting] = useActionState(async (_: any, fd: FormData) => deleteBill(bill.id), null);
  const [updateState, updateAction, isUpdating] = useActionState(async (_: any, fd: FormData) => updateBill(fd), null);

  useEffect(() => {
    if (updateState?.success) {
      setIsEditing(false);
    }
  }, [updateState]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Filter transactions related to this bill
  const billTransactions = allTransactions.filter(t => t.bill_id === bill.id);
  
  // Calculate who has paid
  const memberStatus = members.map(member => {
    const memberPaid = billTransactions.some(t => t.user_id === member.id && t.amount > 0);
    return {
      ...member,
      hasPaid: memberPaid
    };
  });

  return (
    <>
      <Card 
        onClick={() => setIsDetailsOpen(true)}
        className="border-slate-800 bg-slate-900/50 backdrop-blur-xl group hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden"
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant={bill.type === "fixed" ? "secondary" : "outline"} className={bill.type === "fixed" ? "bg-indigo-500/10 text-indigo-400 border-none" : "text-cyan-400 border-cyan-500/20"}>
              {bill.type === "fixed" ? "Fixa" : "Variável"}
            </Badge>
          </div>
          <CardTitle className="text-white text-xl group-hover:text-indigo-400 transition-colors">{bill.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-2xl font-bold text-white">
            {formatCurrency(bill.total_amount)}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="h-4 w-4" />
              <span>Vence {new Date(bill.due_date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <User className="h-4 w-4" />
                <span>{memberStatus.filter(m => m.hasPaid).length}/{memberStatus.length} pagos</span>
              </div>
              <div className="flex -space-x-2">
                {memberStatus.map((m, i) => (
                  <div 
                    key={m.id} 
                    className={`h-6 w-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold ${
                      m.hasPaid ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
                    }`}
                    title={m.full_name}
                  >
                    {m.full_name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                {isEditing ? "Editar Conta" : bill.name}
              </DialogTitle>
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsEditing(true)}
                  className="text-slate-400 hover:text-indigo-400"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <DialogDescription className="text-slate-400">
              {isEditing ? "Altere os detalhes da conta abaixo." : "Acompanhamento de pagamentos e rateio."}
            </DialogDescription>
          </DialogHeader>

          {isEditing ? (
            <form action={updateAction} className="space-y-4 py-4">
              <input type="hidden" name="billId" value={bill.id} />
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" defaultValue={bill.name} className="bg-slate-950 border-slate-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor Total</Label>
                <Input id="amount" name="amount" type="number" step="0.01" defaultValue={bill.total_amount} className="bg-slate-950 border-slate-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Vencimento</Label>
                <Input id="dueDate" name="dueDate" type="date" defaultValue={bill.due_date} className="bg-slate-950 border-slate-800" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1 border-slate-800">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating} className="flex-1 bg-indigo-600 hover:bg-indigo-500">
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Valor Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(bill.total_amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Vencimento</p>
                  <p className="text-lg font-semibold">{new Date(bill.due_date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Participantes</h4>
                <div className="grid gap-2">
                  {memberStatus.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                          {member.full_name.charAt(0)}
                        </div>
                        <span className="font-medium">{member.full_name}</span>
                      </div>
                      {member.hasPaid ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Pago</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500 text-sm italic">
                          <Circle className="h-4 w-4" />
                          <span>Pendente</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-slate-800 flex flex-row justify-between gap-2">
                <form action={async () => {
                  if (confirm("Tem certeza que deseja excluir esta conta?")) {
                    await deleteAction(new FormData());
                    setIsDetailsOpen(false);
                  }
                }} className="flex-1">
                  <Button variant="ghost" className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-2">
                    <Trash2 className="h-4 w-4" />
                    Excluir Conta
                  </Button>
                </form>
                <Button onClick={() => setIsDetailsOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700">
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
