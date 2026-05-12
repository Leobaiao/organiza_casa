"use client";

import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export function TopNav({ profile }: { profile: any }) {
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
            className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-500 w-full"
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

            <form action={logout}>
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
