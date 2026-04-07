import { requireAuth } from "@/lib/guards/require-auth";
import { paymentRequestRepository } from "@/lib/repositories/payment-request.repository";
import type { RequestStatus } from "@prisma/client";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    status?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  const tab = params.tab === "outgoing" ? "outgoing" : "incoming";
  const status = params.status as RequestStatus | undefined;
  const query = params.q;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 10;

  const [result, stats] = await Promise.all([
    tab === "incoming"
      ? paymentRequestRepository.getIncoming(user.id, { status, query, page, pageSize })
      : paymentRequestRepository.getOutgoing(user.id, { status, query, page, pageSize }),
    paymentRequestRepository.getStats(user.id, tab),
  ]);

  return (
    <DashboardContent
      tab={tab}
      requests={result.data}
      stats={stats}
      total={result.total}
      page={page}
      pageSize={pageSize}
      totalPages={result.totalPages}
      currentStatus={status}
      currentQuery={query}
    />
  );
}
