import { requireAuth } from "@/lib/guards/require-auth";
import { activityRepository } from "@/lib/repositories/activity.repository";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { payRequest, declineRequest } from "@/lib/actions/payment-request";
import { formatCents } from "@/lib/utils/currency";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const filter = params.filter;

  const [feed, stats] = await Promise.all([
    activityRepository.getFeed(user.id, page, 10),
    activityRepository.getQuickStats(user.id),
  ]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <div className="rounded-xl border bg-green-50 border-green-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-green-600">Balance</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{formatCents(stats.balance)}</p>
        </div>
        <div className="rounded-xl border bg-amber-50 border-amber-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-600">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats.pendingActions}</p>
        </div>
        <div className="rounded-xl border bg-slate-50 border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{stats.completedPayments}</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Activity</h2>
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
