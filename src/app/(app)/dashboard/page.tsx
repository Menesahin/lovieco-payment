import { requireAuth } from "@/lib/guards/require-auth";
import { activityRepository } from "@/lib/repositories/activity.repository";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { payRequest, declineRequest } from "@/lib/actions/payment-request";
import { formatCents } from "@/lib/utils/currency";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const typeFilter = params.type;

  const [feed, stats] = await Promise.all([
    activityRepository.getFeed(user.id, page, 20),
    activityRepository.getQuickStats(user.id),
  ]);

  const filteredItems = typeFilter
    ? feed.data.filter((item) => item.type === typeFilter)
    : feed.data;

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Top row: Stats + Actions — compact, fixed */}
      <div className="flex flex-col gap-3 shrink-0 lg:flex-row lg:items-start lg:justify-between">
        {/* Stats — inline row */}
        <div className="flex gap-2.5 overflow-x-auto">
          <StatCard label="Balance" value={formatCents(stats.balance)} color="emerald" />
          <StatCard label="Pending" value={String(stats.pendingActions)} color="amber" />
          <StatCard label="Completed" value={String(stats.completedPayments)} color="stone" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Link
            href="/requests/new"
            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-neutral-800 transition-all shadow-sm"
          >
            + New Request
          </Link>
          <Link
            href="/wallet"
            className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-medium hover:bg-stone-50 transition-all"
          >
            Add Funds
          </Link>
        </div>
      </div>

      {/* Activity panel — fills remaining height, scrolls internally */}
      <div className="flex flex-1 flex-col min-h-0 rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        {/* Header — fixed */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 shrink-0">
          <h2 className="text-sm font-semibold">Activity</h2>
          <div className="flex gap-1">
            <FilterLink href="/dashboard" label="All" active={!typeFilter} />
            <FilterLink href="/dashboard?type=request_incoming" label="Incoming" active={typeFilter === "request_incoming"} />
            <FilterLink href="/dashboard?type=request_outgoing" label="Outgoing" active={typeFilter === "request_outgoing"} />
            <FilterLink href="/dashboard?type=topup" label="Top Ups" active={typeFilter === "topup"} />
          </div>
        </div>

        {/* Scrollable feed */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <ActivityFeed
            items={filteredItems}
            total={feed.total}
            page={feed.page}
            totalPages={feed.totalPages}
            onPay={payRequest}
            onDecline={declineRequest}
          />
        </div>

        {/* Pagination — sticky bottom, outside scroll */}
        {feed.totalPages > 1 && (
          <div className="shrink-0 border-t border-stone-100 px-5 py-2.5 flex items-center justify-between bg-white">
            <p className="text-[11px] text-muted-foreground">{feed.page}/{feed.totalPages}</p>
            <div className="flex gap-1.5">
              {feed.page > 1 && (
                <Link href={`/dashboard?page=${feed.page - 1}${typeFilter ? `&type=${typeFilter}` : ""}`} className="rounded-md border border-stone-200 px-2.5 py-1 text-[11px] hover:bg-stone-50 transition-colors">Prev</Link>
              )}
              {feed.page < feed.totalPages && (
                <Link href={`/dashboard?page=${feed.page + 1}${typeFilter ? `&type=${typeFilter}` : ""}`} className="rounded-md border border-stone-200 px-2.5 py-1 text-[11px] hover:bg-stone-50 transition-colors">Next</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: "emerald" | "amber" | "stone" }) {
  const colors = {
    emerald: "border-emerald-200 bg-emerald-50/80 text-emerald-700",
    amber: "border-amber-200 bg-amber-50/80 text-amber-700",
    stone: "border-stone-200 bg-stone-50/80 text-stone-600",
  };
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${colors[color]} min-w-fit`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-lg font-bold font-mono">{value}</span>
    </div>
  );
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
      }`}
    >
      {label}
    </Link>
  );
}
