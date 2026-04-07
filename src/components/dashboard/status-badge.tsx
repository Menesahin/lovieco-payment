import type { RequestStatus } from "@prisma/client";

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  PAID: { label: "Paid", className: "bg-green-100 text-green-800" },
  DECLINED: { label: "Declined", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-700" },
  EXPIRED: { label: "Expired", className: "bg-red-200 text-red-900" },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
