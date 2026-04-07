"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
// Server actions passed as props from page.tsx to avoid Turbopack node:module bundling
import type { RequestDTO } from "@/lib/dto/payment-request.dto";
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
  onPay: (id: string) => Promise<{ success: boolean; error?: string }>;
  onDecline: (id: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function RequestDetail({ request, role, onPay, onDecline, onCancel }: RequestDetailProps) {
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
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold">Payment Successful!</h2>
        <p className="mt-2 text-muted-foreground">
          {request.amountFormatted} sent to {request.senderName ?? request.senderEmail}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
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
          {/* Incoming: Pay + Decline */}
          {role === "recipient" && isPending && !isExpired && (
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => setConfirmAction("pay")} disabled={isPaying}>
                {isPaying ? <LoadingSpinner className="mr-2" /> : null}
                Pay {request.amountFormatted}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setConfirmAction("decline")} disabled={isDeclining}>
                Decline
              </Button>
            </div>
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
  const url = typeof window !== "undefined" ? `${window.location.origin}/r/${token}` : `/r/${token}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-muted/50 p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Share this link with the recipient:</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 rounded-md border bg-background px-2 py-1.5 text-xs"
        />
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
