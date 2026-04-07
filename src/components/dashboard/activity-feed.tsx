"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import type { ActivityItem } from "@/lib/repositories/activity.repository";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ActivityFeedProps {
  items: ActivityItem[];
  total: number;
  page: number;
  totalPages: number;
  onPay: (id: string) => Promise<{ success: boolean; error?: string }>;
  onDecline: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const typeConfig: Record<string, { icon: string; color: string }> = {
  request_incoming: { icon: "↓", color: "bg-amber-100 text-amber-700" },
  request_outgoing: { icon: "↑", color: "bg-blue-100 text-blue-700" },
  payment_sent: { icon: "−", color: "bg-red-100 text-red-700" },
  payment_received: { icon: "+", color: "bg-green-100 text-green-700" },
  topup: { icon: "$", color: "bg-emerald-100 text-emerald-700" },
};

export function ActivityFeed({ items, total, page, totalPages, onPay, onDecline }: ActivityFeedProps) {
  const router = useRouter();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "pay" | "decline"; item: ActivityItem } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, item } = confirmAction;

    startTransition(async () => {
      if (type === "pay") setPayingId(item.requestId);
      const action = type === "pay" ? onPay : onDecline;
      const result = await action(item.requestId!);
      if (result.success) {
        toast.success(type === "pay" ? "Payment successful!" : "Request declined");
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
      setPayingId(null);
      setConfirmAction(null);
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-muted-foreground">No activity yet. Create a payment request or add funds to get started.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/requests/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            New Request
          </Link>
          <Link href="/wallet" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            Add Funds
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {items.map((item) => {
          const config = typeConfig[item.type] ?? typeConfig.topup;
          const isPayProcessing = payingId === item.requestId;

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              {/* Icon */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${config.color}`}>
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.requestId ? (
                    <Link href={`/requests/${item.requestId}`} className="text-sm font-medium hover:underline truncate">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium truncate">{item.title}</span>
                  )}
                  {item.status && <StatusBadge status={item.status as "PENDING" | "PAID" | "DECLINED" | "CANCELLED" | "EXPIRED"} />}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRelative(item.createdAt)}
                </p>
              </div>

              {/* Amount + Actions */}
              <div className="shrink-0 text-right">
                <p className={`text-sm font-semibold ${
                  item.type === "request_incoming" && item.status === "PENDING" ? "text-amber-700" :
                  item.type === "topup" || item.type === "payment_received" || item.type === "request_outgoing" ? "text-green-700" :
                  "text-foreground"
                }`}>
                  {item.amountFormatted}
                </p>

                {/* Inline actions for pending incoming requests */}
                {item.actionable && (
                  <div className="mt-1.5 flex gap-1.5">
                    <Button
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => setConfirmAction({ type: "pay", item })}
                      disabled={isPayProcessing}
                    >
                      {isPayProcessing ? <LoadingSpinner className="h-3 w-3" /> : "Pay"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => setConfirmAction({ type: "decline", item })}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} items)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/dashboard?page=${page - 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/dashboard?page=${page + 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "pay" ? "Confirm Payment" : "Decline Request"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "pay"
                ? `Pay ${confirmAction.item.amountFormatted} to ${confirmAction.item.counterpartyName ?? confirmAction.item.counterpartyEmail}?`
                : `Decline request from ${confirmAction?.item.counterpartyName ?? confirmAction?.item.counterpartyEmail}?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction?.type === "pay" ? "default" : "destructive"}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending && <LoadingSpinner className="mr-2" />}
              {confirmAction?.type === "pay" ? "Confirm Payment" : "Yes, Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
