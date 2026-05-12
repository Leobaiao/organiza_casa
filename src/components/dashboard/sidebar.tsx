import Link from "next/link";
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Settings, 
  Wallet,
  LogOut,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contas", href: "/dashboard/bills", icon: Receipt },
  { label: "Membros", href: "/dashboard/members", icon: Users },
  { label: "Transações", href: "/dashboard/transactions", icon: Wallet },
  { label: "Configurações", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("flex flex-col bg-slate-900/50 backdrop-blur-xl", className)}>
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Organiza <span className="text-indigo-400">Casa</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
          >
            <item.icon className="h-5 w-5 group-hover:text-indigo-400 transition-colors" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <form action={async () => { "use server"; await logout(); }}>
          <button className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all group">
            <LogOut className="h-5 w-5 group-hover:text-rose-400 transition-colors" />
            <span className="font-medium">Sair</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
