"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
// Server actions passed as props from page.tsx to avoid Turbopack node:module bundling
import type { RequestDTO } from "@/lib/dto/payment-request.dto";
import { formatCents } from "@/lib/utils/currency";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { CountdownTimer } from "./countdown-timer";
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

interface RequestDetailProps {
  request: RequestDTO;
  role: "sender" | "recipient";
  walletBalance?: number;
  onPay: (id: string) => Promise<{ success: boolean; error?: string }>;
  onDecline: (id: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function RequestDetail({ request, role, walletBalance, onPay, onDecline, onCancel }: RequestDetailProps) {
  const router = useRouter();
  const [isPaying, startPay] = useTransition();
  const [isDeclining, startDecline] = useTransition();
  const [isCancelling, startCancel] = useTransition();
  const [paySuccess, setPaySuccess] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"pay" | "decline" | "cancel" | null>(null);

  const isPending = request.status === "PENDING";
  const isExpired = new Date(request.expiresAt) < new Date();

  const handlePay = () => {
    startPay(async () => {
      const result = await onPay(request.id);
      if (result.success) {
        setPaySuccess(true);
        toast.success("Payment successful!");
      } else {
        toast.error(result.error);
      }
      setConfirmAction(null);
    });
  };

  const handleDecline = () => {
    startDecline(async () => {
      const result = await onDecline(request.id);
      if (result.success) {
        toast.success("Request declined");
        router.push("/dashboard");
      } else {
        toast.error(result.error);
      }
      setConfirmAction(null);
    });
  };

  const handleCancel = () => {
    startCancel(async () => {
      const result = await onCancel(request.id);
      if (result.success) {
        toast.success("Request cancelled");
        router.push("/dashboard");
      } else {
        toast.error(result.error);
      }
      setConfirmAction(null);
    });
  };

  if (paySuccess) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 animate-[scale-in_0.3s_ease-out]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Payment Successful</h2>
        <p className="mt-3 text-3xl font-bold font-mono text-emerald-700">{request.amountFormatted}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          sent to {request.senderName ?? request.senderEmail}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl border border-stone-300 px-6 py-3 text-sm font-medium hover:bg-stone-50 transition-all"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/wallet"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View Wallet →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        {/* Amount + Status */}
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold">{request.amountFormatted}</span>
          <StatusBadge status={request.status} />
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{role === "recipient" ? "From" : "To"}</span>
            <span className="font-medium">
              {role === "recipient"
                ? request.senderName ?? request.senderEmail
                : request.recipientName ?? request.recipientEmail}
            </span>
          </div>
          {request.note && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Note</span>
              <span className="max-w-[60%] text-right">{request.note}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(request.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          {request.paidAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span>{new Date(request.paidAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          )}
        </div>

        {/* Countdown (pending only) */}
        {isPending && !isExpired && (
          <div className="mt-6">
            <CountdownTimer expiresAt={request.expiresAt} createdAt={request.createdAt} />
          </div>
        )}

        {/* Expired message */}
        {(request.status === "EXPIRED" || (isPending && isExpired)) && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">
            This request has expired and can no longer be paid.
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {/* Incoming: Balance + Pay + Decline */}
          {role === "recipient" && isPending && !isExpired && (
            <>
              {walletBalance !== undefined && (
                <div className={`rounded-lg p-3 text-sm ${
                  walletBalance < request.amountCents
                    ? "bg-red-50 text-red-800"
                    : "bg-green-50 text-green-800"
                }`}>
                  <span className="font-medium">Your balance:</span>{" "}
                  {formatCents(walletBalance)}
                  {walletBalance < request.amountCents && (
                    <span className="block mt-1 text-xs">Insufficient funds. Add funds to pay this request.</span>
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => setConfirmAction("pay")}
                  disabled={isPaying || (walletBalance !== undefined && walletBalance < request.amountCents)}
                >
                  {isPaying ? <LoadingSpinner className="mr-2" /> : null}
                  Pay {request.amountFormatted}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setConfirmAction("decline")} disabled={isDeclining}>
                  Decline
                </Button>
              </div>
            </>
          )}

          {/* Outgoing: Cancel + Share */}
          {role === "sender" && isPending && (
            <>
              <ShareLink token={request.shareableToken} />
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setConfirmAction("cancel")}
                disabled={isCancelling}
              >
                Cancel Request
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "pay" && "Confirm Payment"}
              {confirmAction === "decline" && "Decline Request"}
              {confirmAction === "cancel" && "Cancel Payment Request"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "pay" &&
                `Pay ${request.amountFormatted} to ${request.senderName ?? request.senderEmail}?`}
              {confirmAction === "decline" &&
                `Decline this request from ${request.senderName ?? request.senderEmail}?`}
              {confirmAction === "cancel" &&
                "Cancel this payment request? This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {confirmAction === "cancel" ? "Go Back" : "Cancel"}
            </Button>
            <Button
              variant={confirmAction === "pay" ? "default" : "destructive"}
              onClick={
                confirmAction === "pay"
                  ? handlePay
                  : confirmAction === "decline"
                  ? handleDecline
                  : handleCancel
              }
              disabled={isPaying || isDeclining || isCancelling}
            >
              {(isPaying || isDeclining || isCancelling) && <LoadingSpinner className="mr-2" />}
              {confirmAction === "pay" && "Confirm Payment"}
              {confirmAction === "decline" && "Yes, Decline"}
              {confirmAction === "cancel" && "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShareLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/r/${token}`);

  // Set full URL on client only (avoid hydration mismatch)
  useState(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/r/${token}`);
    }
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 p-4 shadow-sm">
      <p className="mb-2 text-xs font-semibold text-white/80">Share this link with the recipient:</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-xs text-white placeholder-white/50 font-mono"
        />
        <button
          onClick={copy}
          className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-white/90 transition-colors shadow-sm"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
