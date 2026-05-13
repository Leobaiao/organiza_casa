"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillCard } from "./bill-card";
import { Receipt, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface BillsViewProps {
  bills: any[];
  members: any[];
  allTransactions: any[];
  currentUserId: string;
  currentUserRole?: 'admin' | 'member';
}

export function BillsView({ bills, members, allTransactions, currentUserId, currentUserRole }: BillsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  // Sync with URL params
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchTerm(q);
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filteredBills = bills.filter((bill: any) => 
    bill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myBills = filteredBills.filter((bill: any) => {
    const billTransactions = allTransactions.filter((t: any) => t.bill_id === bill.id);
    const myTransactions = billTransactions.filter((t: any) => t.user_id === currentUserId);
    const myBalance = myTransactions.reduce((acc: number, t: any) => acc + t.amount, 0);
    
    // User is involved if they have a debt (negative transaction) for this bill
    const hasDebt = myTransactions.some((t: any) => t.amount < 0);
    
    // Return true if they have a debt and the total balance for this bill is still negative
    return hasDebt && myBalance < -0.01;
  });

  return (
    <div className="w-full">
      <Tabs defaultValue="all" className="w-full">
         <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <TabsList variant="line" className="bg-slate-900/40 p-1 border border-slate-800/50 backdrop-blur-sm h-10">
               <TabsTrigger value="all" className="px-6 data-active:bg-indigo-500/10 data-active:text-indigo-400">
                 Todas ({filteredBills.length})
               </TabsTrigger>
               <TabsTrigger value="mine" className="px-6 data-active:bg-rose-500/10 data-active:text-rose-400">
                 Minhas Pendências ({myBills.length})
               </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full md:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input 
                placeholder="Buscar por nome da conta..." 
                className="pl-10 bg-slate-900/50 border-slate-800 focus:border-indigo-500/50 focus:ring-indigo-500/10 transition-all h-10"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
         </div>

         <TabsContent value="all" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBills.length > 0 ? (
                filteredBills.map((bill: any) => (
                  <BillCard 
                    key={bill.id} 
                    bill={bill} 
                    members={members} 
                    allTransactions={allTransactions} 
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                  />
                ))
              ) : (
                <EmptyState message={searchTerm ? "Nenhuma conta encontrada para esta busca." : "Nenhuma conta cadastrada na casa."} />
              )}
            </div>
         </TabsContent>

         <TabsContent value="mine" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myBills.length > 0 ? (
                myBills.map((bill: any) => (
                  <BillCard 
                    key={bill.id} 
                    bill={bill} 
                    members={members} 
                    allTransactions={allTransactions} 
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                  />
                ))
              ) : (
                <EmptyState message="Você está em dia com todas as suas contas! 🎉" />
              )}
            </div>
         </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="col-span-full border-dashed border-slate-800 bg-slate-900/20 py-20">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
          <Receipt className="h-8 w-8 text-slate-700" />
        </div>
        <p className="text-slate-500 max-w-xs">{message}</p>
      </CardContent>
    </Card>
  );
}
