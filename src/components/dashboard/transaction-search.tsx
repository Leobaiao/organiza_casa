"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function TransactionSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [value, setValue] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (val: string) => {
    setValue(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full md:w-64 group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
      <Input 
        placeholder="Buscar no extrato..." 
        className="pl-10 bg-slate-900/50 border-slate-800 focus:border-indigo-500/50 focus:ring-indigo-500/10 transition-all h-10 text-white"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
