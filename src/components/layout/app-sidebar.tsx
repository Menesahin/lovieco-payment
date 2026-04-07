"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Wallet, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/requests/new", label: "New Request", icon: PlusCircle },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppSidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function AppSidebar({ userName, userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  const initial = (userName?.[0] ?? userEmail?.[0] ?? "U").toUpperCase();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:border-r border-stone-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-stone-200 px-6">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm ring-1 ring-amber-500/20">
          <span className="text-white font-bold text-sm">L</span>
        </div>
        <span className="text-lg font-semibold tracking-tight">Lovie.co</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-stone-100 text-foreground border-l-2 border-amber-500 ml-0 pl-[10px]"
                  : "text-muted-foreground hover:bg-stone-50 hover:text-foreground"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      {(userName || userEmail) && (
        <div className="border-t border-stone-200 px-4 py-4">
          <Link href="/settings" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-stone-50 transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 border border-stone-300/50 flex items-center justify-center">
              <span className="text-xs font-semibold text-stone-600">{initial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{userName ?? userEmail?.split("@")[0]}</p>
              <p className="text-[11px] text-muted-foreground">View settings</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
