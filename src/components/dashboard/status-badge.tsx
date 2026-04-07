import type { RequestStatus } from "@prisma/client";

const statusConfig: Record<RequestStatus, { label: string; dotColor: string; textColor: string; bgColor: string }> = {
  PENDING: { label: "Pending", dotColor: "bg-amber-500", textColor: "text-amber-700", bgColor: "bg-amber-50" },
  PAID: { label: "Paid", dotColor: "bg-emerald-500", textColor: "text-emerald-700", bgColor: "bg-emerald-50" },
  DECLINED: { label: "Declined", dotColor: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" },
  CANCELLED: { label: "Cancelled", dotColor: "bg-stone-400", textColor: "text-stone-600", bgColor: "bg-stone-100" },
  EXPIRED: { label: "Expired", dotColor: "bg-red-400", textColor: "text-red-800", bgColor: "bg-red-100" },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${config.textColor} ${config.bgColor}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
