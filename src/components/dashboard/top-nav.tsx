import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white leading-none mb-1">{profile?.full_name}</p>
            <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5">
            <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
