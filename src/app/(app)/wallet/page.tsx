import { requireAuth } from "@/lib/guards/require-auth";
import { walletRepository } from "@/lib/repositories/wallet.repository";
import { formatCents } from "@/lib/utils/currency";
import type { TransactionDTO } from "@/lib/dto/wallet.dto";
import { TopupModal } from "@/components/wallet/topup-modal";
import { topupWallet } from "@/lib/actions/wallet";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [wallet, txResult] = await Promise.all([
    walletRepository.getOrCreateWallet(user.id),
    walletRepository.getTransactions(user.id, page, 10),
  ]);

  const typeLabels: Record<string, { label: string; color: string }> = {
    TOPUP: { label: "Top Up", color: "text-blue-700 bg-blue-50" },
    PAYMENT_SENT: { label: "Sent", color: "text-red-700 bg-red-50" },
    PAYMENT_RECEIVED: { label: "Received", color: "text-green-700 bg-green-50" },
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Balance Card */}
      <div className="rounded-2xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Available Balance</p>
        <p className="mt-2 text-4xl font-bold">{formatCents(wallet.balanceCents)}</p>
        <div className="mt-4">
          <TopupModal onTopup={topupWallet} />
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Transaction History</h2>
        {txResult.data.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No transactions yet. Add funds to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {txResult.data.map((tx: TransactionDTO) => {
              const config = typeLabels[tx.type] ?? { label: tx.type, color: "" };
              return (
                <div key={tx.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                  <div>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                    <p className="mt-1 text-sm text-muted-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.amountCents >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {tx.amountCents >= 0 ? "+" : ""}{formatCents(Math.abs(tx.amountCents))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bal: {tx.balanceAfterFormatted}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {txResult.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {txResult.totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`/wallet?page=${page - 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
                  Previous
                </a>
              )}
              {page < txResult.totalPages && (
                <a href={`/wallet?page=${page + 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
