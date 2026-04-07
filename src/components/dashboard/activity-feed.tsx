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

const typeConfig: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
  request_incoming: { icon: "↓", iconBg: "bg-amber-100", iconColor: "text-amber-700" },
  request_outgoing: { icon: "↑", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  payment_sent: { icon: "−", iconBg: "bg-red-50", iconColor: "text-red-600" },
  payment_received: { icon: "+", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  topup: { icon: "$", iconBg: "bg-stone-100", iconColor: "text-stone-600" },
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
      const result = await (type === "pay" ? onPay : onDecline)(item.requestId!);
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
      <div className="rounded-2xl border border-stone-200 bg-white p-14 text-center shadow-sm">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="font-medium">No activity yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Create a payment request or add funds to get started.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/requests/new" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-neutral-800 transition-all">
            New Request
          </Link>
          <Link href="/wallet" className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-medium hover:bg-stone-50 transition-all">
            Add Funds
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm divide-y divide-stone-100">
        {items.map((item) => {
          const config = typeConfig[item.type] ?? typeConfig.topup;
          const isPayProcessing = payingId === item.requestId;

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50/50 transition-colors"
            >
              {/* Icon */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${config.iconBg} ${config.iconColor}`}>
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.requestId ? (
                    <Link href={`/requests/${item.requestId}`} className="text-sm font-medium hover:underline underline-offset-2 truncate">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium truncate">{item.title}</span>
                  )}
                  {item.status && (
                    <StatusBadge status={item.status as "PENDING" | "PAID" | "DECLINED" | "CANCELLED" | "EXPIRED"} />
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">&ldquo;{item.description}&rdquo;</p>
                )}
                <p className="text-[11px] text-stone-400 mt-0.5">{formatRelative(item.createdAt)}</p>
              </div>

              {/* Amount + Actions */}
              <div className="shrink-0 text-right">
                <p className={`text-sm font-semibold font-mono ${
                  item.type === "topup" || item.type === "payment_received" ? "text-emerald-600" :
                  item.type === "payment_sent" ? "text-red-600" :
                  item.status === "PAID" && item.type === "request_outgoing" ? "text-emerald-600" :
                  "text-foreground"
                }`}>
                  {item.amountFormatted}
                </p>

                {item.actionable && (
                  <div className="mt-2 flex gap-1.5 justify-end">
                    <Button
                      size="sm"
                      className="h-7 rounded-lg px-3 text-xs shadow-sm"
                      onClick={() => setConfirmAction({ type: "pay", item })}
                      disabled={isPayProcessing}
                    >
                      {isPayProcessing ? <LoadingSpinner className="h-3 w-3" /> : "Pay"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg px-3 text-xs"
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
            Page {page} of {totalPages} &middot; {total} items
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/dashboard?page=${page - 1}`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50 transition-colors">
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/dashboard?page=${page + 1}`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50 transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "pay" ? "Confirm Payment" : "Decline Request"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "pay"
                ? `Pay ${confirmAction.item.amountFormatted} to ${confirmAction.item.counterpartyName ?? confirmAction.item.counterpartyEmail}?`
                : `Decline request from ${confirmAction?.item.counterpartyName ?? confirmAction?.item.counterpartyEmail}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === "pay" ? "default" : "destructive"}
              onClick={handleConfirm}
              disabled={isPending}
              className="rounded-xl"
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
