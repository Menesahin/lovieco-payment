import { requireAuth } from "@/lib/guards/require-auth";
import { activityRepository } from "@/lib/repositories/activity.repository";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { payRequest, declineRequest } from "@/lib/actions/payment-request";
import { formatCents } from "@/lib/utils/currency";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [feed, stats] = await Promise.all([
    activityRepository.getFeed(user.id, page, 10),
    activityRepository.getQuickStats(user.id),
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome + Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your payment activity</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/requests/new"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-neutral-800 transition-all duration-200 shadow-sm"
          >
            + New Request
          </Link>
          <Link
            href="/wallet"
            className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-medium hover:bg-stone-50 transition-all duration-200"
          >
            Add Funds
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Balance</p>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 font-mono">{formatCents(stats.balance)}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending</p>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">{stats.pendingActions}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Completed</p>
            <div className="h-8 w-8 rounded-lg bg-stone-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-700">{stats.completedPayments}</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <ActivityFeed
          items={feed.data}
          total={feed.total}
          page={feed.page}
          totalPages={feed.totalPages}
          onPay={payRequest}
          onDecline={declineRequest}
        />
      </div>
    </div>
  );
}
