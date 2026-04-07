import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { walletRepository } from "@/lib/repositories/wallet.repository";
import { formatCents } from "@/lib/utils/currency";
import { TopupModal } from "@/components/wallet/topup-modal";
import { topupWallet } from "@/lib/actions/wallet";
import { Plus } from "lucide-react";

export async function TopBar() {
  const session = await auth();

  let balanceFormatted = "$0.00";
  if (session?.user?.id) {
    const wallet = await walletRepository.getOrCreateWallet(session.user.id);
    balanceFormatted = formatCents(wallet.balanceCents);
  }

  const initial = (session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "U").toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 lg:px-6 shadow-[0_1px_3px_0_rgb(0,0,0,0.03)]">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center ring-1 ring-amber-500/20">
          <span className="text-white font-bold text-xs">L</span>
        </div>
        <span className="text-base font-semibold">Lovie.co</span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {session?.user && (
          <>
            {/* Balance badge — mini card format */}
            <div className="flex items-center gap-1.5">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl px-3.5 py-1.5">
                <p className="text-[9px] font-medium text-emerald-600/70 uppercase tracking-wider leading-none">Balance</p>
                <p className="text-sm font-bold text-emerald-700 font-mono leading-tight">{balanceFormatted}</p>
              </div>
              <TopupModal onTopup={topupWallet} />
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 border border-stone-300/50 flex items-center justify-center">
                <span className="text-xs font-semibold text-stone-600">{initial}</span>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline max-w-[120px] truncate">
                {session.user.name ?? session.user.email}
              </span>
            </div>
          </>
        )}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="ghost" size="sm" type="submit" className="text-xs text-muted-foreground hover:text-foreground">
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  );
}
