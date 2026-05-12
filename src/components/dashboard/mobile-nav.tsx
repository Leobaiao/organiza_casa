"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Wallet,
  Settings,
  DollarSign 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contas", href: "/dashboard/bills", icon: Receipt },
  { label: "Pix", href: "/dashboard/transactions/quick", icon: DollarSign },
  { label: "Membros", href: "/dashboard/members", icon: Users },
  { label: "Extrato", href: "/dashboard/transactions", icon: Wallet },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-all",
                isActive ? "text-indigo-400" : "text-slate-500"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "animate-in zoom-in-75")} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 h-1 w-8 bg-indigo-500 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
