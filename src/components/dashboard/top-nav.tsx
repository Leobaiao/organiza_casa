"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function TopNav({ profile }: { profile: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  // Sync state if URL changes externally (e.g., search on Bills page)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== searchValue) {
      setSearchValue(q);
    }
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-white truncate max-w-[200px] md:max-w-none">
          {profile?.households?.name || "Minha Casa"}
        </h2>
        <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 gap-2 w-64 focus-within:border-indigo-500/50 transition-all">
          <Search className="h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-500 w-full text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="h-8 w-[1px] bg-slate-800 mx-1 md:mx-2" />
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/settings"
              className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 outline-none transition-transform active:scale-95 flex items-center justify-center overflow-hidden"
              title="Configurações"
            >
              <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-400" />
              </div>
            </Link>

            <form action={async () => { await logout(); }}>
              <button 
                type="submit"
                className="h-9 w-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all active:scale-95"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
      </div>
    </header>
  );
}
