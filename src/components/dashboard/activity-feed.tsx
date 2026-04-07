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
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <p className="text-sm font-medium text-stone-500">No activity yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Create a request or add funds to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-stone-100">
        {items.map((item) => {
          const config = typeConfig[item.type] ?? typeConfig.topup;
          const isPayProcessing = payingId === item.requestId;

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-colors"
            >
              {/* Icon */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${config.iconBg} ${config.iconColor}`}>
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
                <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                  {item.description ? `${item.description} · ` : ""}{formatRelative(item.createdAt)}
                </p>
              </div>

              {/* Amount + Actions */}
              <div className="shrink-0 text-right">
                <p className={`text-xs font-semibold font-mono ${
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

      {/* Pagination moved to page.tsx for sticky bottom behavior */}

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
