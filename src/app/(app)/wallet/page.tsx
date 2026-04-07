import { requireAuth } from "@/lib/guards/require-auth";
import { walletRepository } from "@/lib/repositories/wallet.repository";
import { formatCents } from "@/lib/utils/currency";
import type { TransactionDTO } from "@/lib/dto/wallet.dto";
import { TopupModal } from "@/components/wallet/topup-modal";
import { topupWallet } from "@/lib/actions/wallet";
import Link from "next/link";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const typeFilter = params.type;

  const [wallet, txResult] = await Promise.all([
    walletRepository.getOrCreateWallet(user.id),
    walletRepository.getTransactions(user.id, page, 10),
  ]);

  // Client-side filter (for now — could move to repository for DB-level filtering)
  const filteredData = typeFilter
    ? txResult.data.filter((tx: TransactionDTO) => tx.type === typeFilter)
    : txResult.data;

  const typeConfig: Record<string, { label: string; dotColor: string }> = {
    TOPUP: { label: "Top Up", dotColor: "bg-blue-500" },
    PAYMENT_SENT: { label: "Sent", dotColor: "bg-red-500" },
    PAYMENT_RECEIVED: { label: "Received", dotColor: "bg-emerald-500" },
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden mx-auto max-w-3xl w-full">
      {/* Balance Card — compact, fixed */}
      <div className="shrink-0 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 px-6 py-5 text-white shadow-lg flex items-center justify-between">
        <div>
          <p className="text-[10px] text-stone-500 font-medium uppercase tracking-widest">Balance</p>
          <p className="mt-1 text-3xl font-bold font-mono tracking-tight">
            {formatCents(wallet.balanceCents)}
          </p>
        </div>
        <TopupModal onTopup={topupWallet} />
      </div>

      {/* Transaction History — fills remaining, scrolls internally */}
      <div className="flex flex-1 flex-col min-h-0 rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-stone-100">
          <h2 className="text-sm font-semibold">Transactions</h2>
          {/* Type Filter */}
          <div className="flex gap-1.5">
            <FilterPill href="/wallet" label="All" active={!typeFilter} />
            <FilterPill href="/wallet?type=TOPUP" label="Top Up" active={typeFilter === "TOPUP"} />
            <FilterPill href="/wallet?type=PAYMENT_SENT" label="Sent" active={typeFilter === "PAYMENT_SENT"} />
            <FilterPill href="/wallet?type=PAYMENT_RECEIVED" label="Received" active={typeFilter === "PAYMENT_RECEIVED"} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
        {filteredData.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground">
              {typeFilter ? "No transactions match this filter." : "No transactions yet. Add funds to get started."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredData.map((tx: TransactionDTO) => {
                    const config = typeConfig[tx.type] ?? { label: tx.type, dotColor: "bg-stone-400" };
                    return (
                      <tr key={tx.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                            <span className="font-medium">{config.label}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground max-w-[200px] truncate">{tx.description}</td>
                        <td className={`px-5 py-3.5 text-right font-mono font-semibold ${tx.amountCents >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {tx.amountCents >= 0 ? "+" : ""}{formatCents(Math.abs(tx.amountCents))}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-muted-foreground">
                          {tx.balanceAfterFormatted}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-stone-100 md:hidden">
              {filteredData.map((tx: TransactionDTO) => {
                const config = typeConfig[tx.type] ?? { label: tx.type, dotColor: "bg-stone-400" };
                return (
                  <div key={tx.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <span className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                        <span className="font-medium">{config.label}</span>
                      </span>
                      <span className={`text-sm font-mono font-semibold ${tx.amountCents >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {tx.amountCents >= 0 ? "+" : ""}{formatCents(Math.abs(tx.amountCents))}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">{tx.description}</p>
                    <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                      <span>{new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span>Bal: {tx.balanceAfterFormatted}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        </div>{/* end scroll wrapper */}

        {/* Pagination — sticky bottom */}
        {txResult.totalPages > 1 && (
          <div className="shrink-0 border-t border-stone-100 px-5 py-2.5 flex items-center justify-between bg-white">
            <p className="text-[11px] text-muted-foreground font-mono">
              Page {page} of {txResult.totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/wallet?page=${page - 1}${typeFilter ? `&type=${typeFilter}` : ""}`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50 transition-colors">
                  Previous
                </Link>
              )}
              {page < txResult.totalPages && (
                <Link href={`/wallet?page=${page + 1}${typeFilter ? `&type=${typeFilter}` : ""}`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50 transition-colors">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-stone-900 text-white"
          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
      }`}
    >
      {label}
    </Link>
  );
}
