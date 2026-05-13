"use client";

import { useState, useActionState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, User, Trash2, Edit2, CheckCircle2, Circle, Loader2, X, Home, Zap, Droplet, Wifi, ShoppingCart, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { deleteBill, updateBill, payBill } from "@/app/actions/bills";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BillCardProps {
  bill: any;
  members: any[];
  allTransactions: any[];
  currentUserId?: string;
  currentUserRole?: 'admin' | 'member';
}

export function BillCard({ bill, members, allTransactions, currentUserId, currentUserRole }: BillCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Filter transactions related to this bill
  const billTransactions = allTransactions.filter(t => t.bill_id === bill.id);
  
  // Identify actual participants (those who have a debit for this bill)
  const debitTransactions = billTransactions.filter(t => t.amount < 0);
  const participantIds = new Set(debitTransactions.map(t => t.user_id));

  // Calculate who has paid among actual participants
  const participantStatus = members
    .filter(member => participantIds.has(member.id))
    .map(member => {
      const memberTransactions = billTransactions.filter(t => t.user_id === member.id);
      const memberBalance = memberTransactions.reduce((acc, t) => acc + t.amount, 0);
      
      // The individual amount is the absolute value of the debit transaction for this user
      const userDebit = debitTransactions.find(t => t.user_id === member.id);
      const individualAmount = userDebit ? Math.abs(userDebit.amount) : 0;
      
      const hasPaid = memberBalance >= -0.01; // Balance for this bill is not negative

      return {
        ...member,
        hasPaid,
        individualAmount,
        memberBalance
      };
    });

  const [isPaying, startTransition] = useTransition();

  const handlePay = (member: any) => {
    startTransition(async () => {
      await payBill(bill.id, member.id, member.individualAmount, bill.name);
      setIsDetailsOpen(false);
    });
  };

  const [deleteState, deleteAction, isDeleting] = useActionState(async (_: any, fd: FormData) => deleteBill(bill.id), null);

  const isOwner = currentUserId === bill.created_by;
  const canEdit = currentUserRole === 'admin' || isOwner;

  const getCategoryIcon = (category: string, sizeClass: string = "h-4 w-4") => {
    switch (category) {
      case 'rent': return <Home className={`${sizeClass} text-indigo-400`} />;
      case 'electricity': return <Zap className={`${sizeClass} text-yellow-400`} />;
      case 'water': return <Droplet className={`${sizeClass} text-blue-400`} />;
      case 'internet': return <Wifi className={`${sizeClass} text-emerald-400`} />;
      case 'supermarket': return <ShoppingCart className={`${sizeClass} text-orange-400`} />;
      case 'maintenance': return <Wrench className={`${sizeClass} text-slate-400`} />;
      default: return <Receipt className={`${sizeClass} text-indigo-400`} />;
    }
  };

  return (
    <>
      <Card 
        className="group border-slate-800 bg-slate-900/50 backdrop-blur-xl hover:border-slate-700 transition-all cursor-pointer overflow-hidden relative"
        onClick={() => setIsDetailsOpen(true)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center shadow-inner shadow-slate-700/20">
                {getCategoryIcon(bill.category || 'other')}
              </div>
              <CardTitle className="text-lg font-bold text-white">{bill.name}</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-700 text-slate-500">
              {bill.type === 'fixed' ? 'Fixa' : 'Variável'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              {(() => {
                const currentUserStatus = participantStatus.find(p => p.id === currentUserId);
                const currentUserShare = currentUserStatus?.individualAmount || 0;
                
                if (currentUserShare > 0) {
                  return (
                    <>
                      <p className="text-[10px] text-emerald-500/80 uppercase font-bold tracking-widest">
                        Minha Parte
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <p className="text-xl font-bold text-emerald-400">{formatCurrency(currentUserShare)}</p>
                        <p className="text-[10px] text-slate-500 font-medium">/ {formatCurrency(bill.total_amount)}</p>
                      </div>
                    </>
                  );
                }
                
                return (
                  <>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Valor Total</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(bill.total_amount)}</p>
                  </>
                );
              })()}
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center justify-end gap-1">
                <Calendar className="h-3 w-3" /> Vencimento
              </p>
              <p className="text-sm font-semibold text-slate-300">
                {new Date(bill.due_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
            <div className="flex -space-x-2">
              {participantStatus.slice(0, 4).map((member, i) => (
                <div 
                  key={member.id} 
                  className={`h-6 w-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold ${
                    member.hasPaid ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                  title={member.full_name}
                >
                  {member.full_name.charAt(0)}
                </div>
              ))}
              {participantStatus.length > 4 && (
                <div className="h-6 w-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                  +{participantStatus.length - 4}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium italic">
              Clique para ver detalhes
            </p>
          </div>
        </CardContent>
        {/* Subtle hover effect light */}
        <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all" />
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute right-12 top-4 rounded-sm opacity-70 ring-offset-slate-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2"
            >
              <Edit2 className="h-4 w-4 text-slate-400 hover:text-white" />
              <span className="sr-only">Editar</span>
            </button>
          )}
          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-800/50 border border-slate-700/50 shadow-inner shadow-slate-700/20 flex items-center justify-center text-indigo-400">
                  {getCategoryIcon(bill.category || 'other', 'h-6 w-6')}
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">{bill.name}</DialogTitle>
                  <DialogDescription className="text-slate-500">Detalhes do rateio e pagamentos.</DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {isEditing ? (
            <form action={async (fd) => {
              fd.set("billId", bill.id);
              const res = await updateBill(fd);
              if (res.success) setIsEditing(false);
            }} className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Conta</Label>
                  <Input id="name" name="name" defaultValue={bill.name} className="bg-slate-950 border-slate-800" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <select 
                    id="category" 
                    name="category" 
                    defaultValue={bill.category || 'other'}
                    className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="other">🧾 Outros</option>
                    <option value="rent">🏠 Aluguel/Condomínio</option>
                    <option value="electricity">⚡ Energia</option>
                    <option value="water">💧 Água</option>
                    <option value="internet">🌐 Internet/TV</option>
                    <option value="supermarket">🛒 Mercado</option>
                    <option value="maintenance">🔧 Manutenção</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor Total</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" defaultValue={bill.total_amount} className="bg-slate-950 border-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Vencimento</Label>
                    <Input id="dueDate" name="dueDate" type="date" defaultValue={new Date(bill.due_date).toISOString().split('T')[0]} className="bg-slate-950 border-slate-800" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Participantes do Rateio</Label>
                  <ScrollArea className="h-[120px] rounded-md border border-slate-800 p-2 bg-slate-950/50">
                    <div className="space-y-2">
                      {members.map((member) => {
                        const isParticipant = participantIds.has(member.id);
                        return (
                          <div key={member.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`edit-member-${member.id}`} 
                              name="memberIds" 
                              value={member.id} 
                              defaultChecked={isParticipant}
                              className="border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <label
                              htmlFor={`edit-member-${member.id}`}
                              className="text-sm font-medium leading-none text-slate-300"
                            >
                              {member.full_name}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  <p className="text-[10px] text-slate-500 italic">* O valor será recalculado e dividido entre os selecionados.</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500">Salvar Alterações</Button>
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
                <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {participantStatus.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          member.hasPaid ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-700 text-slate-300"
                        }`}>
                          {member.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.full_name}</p>
                          <p className="text-[10px] text-slate-500 font-bold">
                            {(currentUserRole === 'admin' || member.id === currentUserId) ? formatCurrency(member.individualAmount) : "---"}
                          </p>
                        </div>
                      </div>
                      {member.hasPaid ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Pago</span>
                        </div>
                      ) : (
                        (currentUserRole === 'admin' || member.id === currentUserId) ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handlePay(member)}
                            disabled={isPaying}
                            className="h-8 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 gap-1"
                          >
                            {isPaying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Circle className="h-3 w-3" />}
                            Pagar
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-500 text-sm font-bold">
                            <Circle className="h-4 w-4" />
                            <span>Pendente</span>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="mt-2 flex flex-col">
                {currentUserRole === 'admin' && (
                  <AlertDialog>
                    <AlertDialogTrigger render={
                      <Button 
                        variant="ghost" 
                        className="w-full text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 gap-2 font-bold"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir Conta
                      </Button>
                    } />
                    <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          Tem certeza que deseja excluir a conta <span className="text-white font-bold">"{bill.name}"</span>? Esta ação removerá também todos os rateios associados e não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="bg-slate-950/50">
                        <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                          Cancelar
                        </AlertDialogCancel>
                        <form action={deleteAction}>
                          <Button 
                            type="submit" 
                            disabled={isDeleting}
                            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white border-none"
                          >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Confirmar Exclusão
                          </Button>
                        </form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
