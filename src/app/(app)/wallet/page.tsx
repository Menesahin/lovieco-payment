import { requireAuth } from "@/lib/guards/require-auth";
import { walletRepository } from "@/lib/repositories/wallet.repository";
import { formatCents } from "@/lib/utils/currency";
import type { TransactionDTO } from "@/lib/dto/wallet.dto";
import { TopupModal } from "@/components/wallet/topup-modal";
import { topupWallet } from "@/lib/actions/wallet";
import Link from "next/link";
import { Wallet, Receipt } from "lucide-react";

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
      {/* Balance Card */}
      <div className="shrink-0 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 px-6 py-6 text-white shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Wallet className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">Balance</p>
            <p className="mt-0.5 text-3xl font-bold font-mono tracking-tight">
              {formatCents(wallet.balanceCents)}
            </p>
          </div>
        </div>
        <TopupModal onTopup={topupWallet} />
      </div>

      {/* Transaction History */}
      <div className="flex flex-1 flex-col min-h-0 rounded-2xl border border-stone-200/80 bg-white shadow-sm overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
          <h2 className="text-sm font-semibold">Transactions</h2>
          <div className="flex gap-1.5">
            <FilterPill href="/wallet" label="All" active={!typeFilter} />
            <FilterPill href="/wallet?type=TOPUP" label="Top Up" active={typeFilter === "TOPUP"} />
            <FilterPill href="/wallet?type=PAYMENT_SENT" label="Sent" active={typeFilter === "PAYMENT_SENT"} />
            <FilterPill href="/wallet?type=PAYMENT_RECEIVED" label="Received" active={typeFilter === "PAYMENT_RECEIVED"} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <Receipt className="h-16 w-16 text-stone-200" strokeWidth={1} />
              <p className="mt-4 text-base font-medium text-stone-500">
                {typeFilter ? "No transactions match this filter" : "No transactions yet"}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {typeFilter ? "Try a different filter." : "Add funds to get started."}
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
                        <tr key={tx.id} className="hover:bg-stone-50/60 transition-colors duration-150">
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
                    <div key={tx.id} className="px-5 py-3.5 hover:bg-stone-50/60 transition-colors duration-150">
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
        </div>

        {/* Pagination */}
        {txResult.totalPages > 1 && (
          <div className="shrink-0 border-t border-stone-100 px-5 py-2.5 flex items-center justify-between bg-white">
            <p className="text-[11px] text-muted-foreground font-mono">
              Page {page} of {txResult.totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/wallet?page=${page - 1}${typeFilter ? `&type=${typeFilter}` : ""}`} className="rounded-xl border border-stone-300 px-3.5 py-1.5 text-sm hover:bg-stone-50 transition-colors active:scale-[0.98]">
                  Previous
                </Link>
              )}
              {page < txResult.totalPages && (
                <Link href={`/wallet?page=${page + 1}${typeFilter ? `&type=${typeFilter}` : ""}`} className="rounded-xl border border-stone-300 px-3.5 py-1.5 text-sm hover:bg-stone-50 transition-colors active:scale-[0.98]">
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
      className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all duration-200 ${
        active
          ? "bg-stone-900 text-white shadow-sm"
          : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
      }`}
    >
      {label}
    </Link>
  );
}
