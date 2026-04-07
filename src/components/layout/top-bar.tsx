import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { walletRepository } from "@/lib/repositories/wallet.repository";
import { formatCents } from "@/lib/utils/currency";
import { TopupModal } from "@/components/wallet/topup-modal";
import { topupWallet } from "@/lib/actions/wallet";

export async function TopBar() {
  const session = await auth();

  let balanceFormatted = "$0.00";
  if (session?.user?.id) {
    const wallet = await walletRepository.getOrCreateWallet(session.user.id);
    balanceFormatted = formatCents(wallet.balanceCents);
  }

  const initial = (session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "U").toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 lg:px-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
          <span className="text-white font-bold text-xs">L</span>
        </div>
        <span className="text-base font-semibold">LovePay</span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {session?.user && (
          <>
            {/* Balance badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg font-mono">
                {balanceFormatted}
              </span>
              <TopupModal onTopup={topupWallet} />
            </div>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
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
          <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-foreground">
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  );
}
