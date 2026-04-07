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

import { ArrowDownLeft, ArrowUpRight, Minus, Plus, Wallet as WalletIcon, Inbox } from "lucide-react";

const typeConfig: Record<string, { icon: React.ReactNode; iconBg: string }> = {
  request_incoming: { icon: <ArrowDownLeft className="h-4 w-4" />, iconBg: "bg-amber-100 text-amber-700" },
  request_outgoing: { icon: <ArrowUpRight className="h-4 w-4" />, iconBg: "bg-blue-50 text-blue-600" },
  payment_sent: { icon: <Minus className="h-4 w-4" />, iconBg: "bg-red-50 text-red-600" },
  payment_received: { icon: <Plus className="h-4 w-4" />, iconBg: "bg-emerald-50 text-emerald-600" },
  topup: { icon: <WalletIcon className="h-4 w-4" />, iconBg: "bg-stone-100 text-stone-600" },
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
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <Inbox className="h-16 w-16 text-stone-200" strokeWidth={1} />
        <p className="mt-4 text-base font-medium text-stone-500">No activity yet</p>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
          Create a request or add funds to get started.
        </p>
        <Link
          href="/requests/new"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-neutral-800 hover:shadow-md active:scale-[0.98]"
        >
          Create your first request
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-stone-100">
        {items.map((item) => {
          const config = typeConfig[item.type] ?? typeConfig.topup;
          const isPayProcessing = payingId === item.requestId;

          const rowContent = (
            <>
              {/* Icon */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}>
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">{item.title}</span>
                  {item.status && (
                    <StatusBadge status={item.status as "PENDING" | "PAID" | "DECLINED" | "CANCELLED" | "EXPIRED"} />
                  )}
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                  {item.description ? `${item.description} · ` : ""}{formatRelative(item.createdAt)}
                </p>
              </div>
            </>
          );

          // Actionable items need div (buttons inside), others get full-row Link
          if (item.actionable) {
            return (
              <div
                key={item.id}
                className="group flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/60 transition-colors duration-150 border-l-2 border-transparent hover:border-amber-500/60"
              >
                {rowContent}

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
                    {item.requestId && (
                      <Link
                        href={`/requests/${item.requestId}`}
                        className="h-7 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors inline-flex items-center"
                      >
                        Details →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
            );
          }

          // Non-actionable: entire row is a link
          return (
            <Link
              key={item.id}
              href={item.requestId ? `/requests/${item.requestId}` : "/wallet"}
              className="group flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/60 transition-colors duration-150 border-l-2 border-transparent hover:border-amber-500/60 cursor-pointer"
            >
              {rowContent}
              <div className="shrink-0 text-right">
                <p className={`text-xs font-semibold font-mono ${
                  item.type === "topup" || item.type === "payment_received" ? "text-emerald-600" :
                  item.type === "payment_sent" ? "text-red-600" :
                  item.status === "PAID" && item.type === "request_outgoing" ? "text-emerald-600" :
                  "text-foreground"
                }`}>
                  {item.amountFormatted}
                </p>
              </div>
            </Link>
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
