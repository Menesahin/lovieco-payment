import { requireAuth } from "@/lib/guards/require-auth";
import { activityRepository } from "@/lib/repositories/activity.repository";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { payRequest, declineRequest } from "@/lib/actions/payment-request";
import { formatCents } from "@/lib/utils/currency";
import Link from "next/link";
import { Home, Clock, CheckCircle, Plus, Wallet } from "lucide-react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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

  const displayName = user.name ?? user.email?.split("@")[0] ?? "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden">
      {/* Greeting + Actions */}
      <div className="flex flex-col gap-3 shrink-0 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Link
            href="/requests/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-neutral-800 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Request
          </Link>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-5 py-2.5 text-xs font-medium transition-all duration-200 hover:bg-stone-50 hover:border-stone-400 active:scale-[0.98]"
          >
            <Wallet className="h-3.5 w-3.5" />
            Add Funds
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <StatCard
          icon={<Home className="h-4 w-4" />}
          iconBg="bg-emerald-100 text-emerald-700"
          label="Balance"
          value={formatCents(stats.balance)}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          iconBg="bg-amber-100 text-amber-700"
          label="Pending"
          value={String(stats.pendingActions)}
        />
        <StatCard
          icon={<CheckCircle className="h-4 w-4" />}
          iconBg="bg-stone-100 text-stone-600"
          label="Completed"
          value={String(stats.completedPayments)}
        />
      </div>

      {/* Activity panel */}
      <div className="flex flex-1 flex-col min-h-0 rounded-2xl border border-stone-200/80 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Activity</h2>
            {stats.pendingActions > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <div className="flex gap-1.5">
            <FilterPill href="/dashboard" label="All" active={!typeFilter} />
            <FilterPill href="/dashboard?type=request_incoming" label="Incoming" active={typeFilter === "request_incoming"} />
            <FilterPill href="/dashboard?type=request_outgoing" label="Outgoing" active={typeFilter === "request_outgoing"} />
            <FilterPill href="/dashboard?type=topup" label="Top Ups" active={typeFilter === "topup"} />
          </div>
        </div>

        {/* Feed — scrollable */}
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

        {/* Pagination — sticky bottom */}
        {feed.totalPages > 1 && (
          <div className="shrink-0 border-t border-stone-100 px-5 py-2.5 flex items-center justify-between bg-white">
            <p className="text-[11px] text-muted-foreground font-mono">{feed.page}/{feed.totalPages}</p>
            <div className="flex gap-1.5">
              {feed.page > 1 && (
                <Link href={`/dashboard?page=${feed.page - 1}${typeFilter ? `&type=${typeFilter}` : ""}`} className="rounded-md border border-stone-200 px-2.5 py-1 text-[11px] font-medium hover:bg-stone-50 transition-colors">Prev</Link>
              )}
              {feed.page < feed.totalPages && (
                <Link href={`/dashboard?page=${feed.page + 1}${typeFilter ? `&type=${typeFilter}` : ""}`} className="rounded-md border border-stone-200 px-2.5 py-1 text-[11px] font-medium hover:bg-stone-50 transition-colors">Next</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-xl font-bold font-mono tracking-tight">{value}</p>
        </div>
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
