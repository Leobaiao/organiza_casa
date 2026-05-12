"use client";

import { useState } from "react";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  User as UserIcon,
  Receipt,
  DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface TransactionListProps {
  transactions: any[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const payments = transactions.filter(t => t.amount > 0);
  const splits = transactions.filter(t => t.amount < 0);

  const renderTable = (data: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
            <th className="px-6 py-4 font-medium">Data</th>
            <th className="px-6 py-4 font-medium">Membro</th>
            <th className="px-6 py-4 font-medium">Descrição</th>
            <th className="px-6 py-4 font-medium text-center">Anexo</th>
            <th className="px-6 py-4 font-medium text-right">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                Nenhuma movimentação encontrada nesta categoria.
              </td>
            </tr>
          ) : (
            data.map((t) => (
              <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-slate-300">{formatDate(t.created_at)}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-white">
                      {t.profiles?.full_name || "Desconhecido"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-300">{t.description}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  {t.receipt_url ? (
                    <a 
                      href={t.receipt_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                      title="Ver Comprovante"
                    >
                      <Receipt className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-slate-700">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {t.amount > 0 ? (
                      <ArrowUpCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 text-rose-400" />
                    )}
                    <span className={`text-sm font-bold ${t.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {t.amount > 0 ? "+" : "-"} {formatCurrency(t.amount)}
                    </span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="flex items-center justify-between mb-6">
        <TabsList className="bg-slate-900 border border-slate-800 p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            Tudo
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="splits" className="data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-400">
            Rateios
          </TabsTrigger>
        </TabsList>
        
        <div className="hidden md:flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            Entradas
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-400" />
            Saídas
          </div>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
        <TabsContent value="all" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderTable(transactions)}
        </TabsContent>
        <TabsContent value="payments" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderTable(payments)}
        </TabsContent>
        <TabsContent value="splits" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderTable(splits)}
        </TabsContent>
      </Card>
    </Tabs>
  );
}
