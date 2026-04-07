"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Wallet, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/requests/new", label: "New", icon: PlusCircle },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-stone-200 bg-white/95 backdrop-blur-sm py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 min-h-[44px] min-w-[44px] justify-center rounded-full px-3 py-1.5 text-[10px] font-medium transition-all duration-200 ${
              isActive
                ? "bg-amber-50 text-amber-700"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
