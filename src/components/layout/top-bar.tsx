import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { walletRepository } from "@/lib/repositories/wallet.repository";
import { toWalletDTO } from "@/lib/dto/wallet.dto";
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

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">L</span>
        </div>
        <span className="text-lg font-semibold tracking-tight">LovePay</span>
      </div>
      <div className="lg:flex-1" />
      <div className="flex items-center gap-3">
        {session?.user && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">
              {balanceFormatted}
            </span>
            <TopupModal onTopup={topupWallet} />
          </div>
        )}
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {session?.user?.name ?? session?.user?.email}
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="ghost" size="sm" type="submit">
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  );
}
