"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/guards/require-auth";
import { createRequestSchema } from "@/lib/validations/payment-request";
import { paymentRequestRepository } from "@/lib/repositories/payment-request.repository";
import { logger } from "@/lib/logger";

// ─── Create Request (spec § 3.2) ───

export async function createRequest(formData: FormData) {
  const user = await requireAuth();

  const raw = {
    recipientEmail: formData.get("recipientEmail") as string,
    amountCents: Number(formData.get("amountCents")),
    note: (formData.get("note") as string) || undefined,
  };

  const parsed = createRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.recipientEmail === user.email) {
    return { success: false as const, error: "You cannot request money from yourself" };
  }

  let requestId: string;
  try {
    const request = await paymentRequestRepository.create({
      ...parsed.data,
      senderId: user.id,
    });
    requestId = request.id;
    logger.info({ requestId, amount: parsed.data.amountCents, to: parsed.data.recipientEmail }, "payment_request_created");
  } catch (error) {
    logger.error({ error }, "create_request_failed");
    return { success: false as const, error: "Something went wrong. Please try again." };
  }

  revalidatePath("/dashboard");
  redirect(`/requests/${requestId}`);
}

// ─── Pay Request (spec § 3.5, ADR-010) ───
// DB-02 fix: sleep OUTSIDE transaction to minimize lock duration

export async function payRequest(requestId: string) {
  const user = await requireAuth();

  // Simulate payment processing BEFORE transaction (UI delay only)
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Atomic transaction: guard → balance check → transfer → audit → status
  const result = await prisma.$transaction(
    async (tx) => {
      // a. Request guards (fail-fast)
      const request = await tx.paymentRequest.findUnique({ where: { id: requestId } });
      if (!request) return { success: false as const, error: "Request not found" };
      if (request.recipientId !== user.id) return { success: false as const, error: "You are not authorized to pay this request" };
      if (request.status !== "PENDING") return { success: false as const, error: "This request is no longer pending" };
      if (request.expiresAt < new Date()) {
        await tx.paymentRequest.update({ where: { id: requestId }, data: { status: "EXPIRED" } });
        return { success: false as const, error: "This request has expired and can no longer be paid" };
      }

      // b. Payer wallet — must exist and have sufficient balance
      const payerWallet = await tx.wallet.findUnique({ where: { userId: user.id } });
      if (!payerWallet || payerWallet.balanceCents < request.amountCents) {
        return { success: false as const, error: "Insufficient funds. Add funds to pay this request." };
      }

      // c. Receiver wallet — create if doesn't exist
      const receiverWallet = await tx.wallet.upsert({
        where: { userId: request.senderId },
        create: { userId: request.senderId, balanceCents: 0 },
        update: {},
      });

      // d. Atomic balance transfer (decrement/increment = race-condition safe)
      await tx.wallet.update({
        where: { id: payerWallet.id },
        data: { balanceCents: { decrement: request.amountCents } },
      });
      await tx.wallet.update({
        where: { id: receiverWallet.id },
        data: { balanceCents: { increment: request.amountCents } },
      });

      // e. Audit trail — two transaction records
      const payerBalanceAfter = payerWallet.balanceCents - request.amountCents;
      const receiverBalanceAfter = receiverWallet.balanceCents + request.amountCents;

      await tx.transaction.createMany({
        data: [
          {
            type: "PAYMENT_SENT",
            amountCents: -request.amountCents,
            balanceAfter: payerBalanceAfter,
            description: `Payment for: ${request.note ?? "Payment request"}`,
            userId: user.id,
            requestId,
          },
          {
            type: "PAYMENT_RECEIVED",
            amountCents: request.amountCents,
            balanceAfter: receiverBalanceAfter,
            description: `Received payment: ${request.note ?? "Payment request"}`,
            userId: request.senderId,
            requestId,
          },
        ],
      });

      // f. Update request status
      await tx.paymentRequest.update({
        where: { id: requestId },
        data: { status: "PAID", paidAt: new Date() },
      });

      logger.info(
        { requestId, payerId: user.id, receiverId: request.senderId, amount: request.amountCents },
        "payment_completed"
      );

      return { success: true as const, newBalance: payerBalanceAfter };
    },
    { isolationLevel: "Serializable", timeout: 5000 }
  );

  if (result.success) {
    revalidatePath("/", "layout");
    revalidatePath(`/requests/${requestId}`);
  }
  return result;
}

// ─── Decline Request (spec § 3.4.4) ───

export async function declineRequest(requestId: string) {
  const user = await requireAuth();

  const result = await prisma.$transaction(
    async (tx) => {
      const request = await tx.paymentRequest.findUnique({ where: { id: requestId } });

      if (!request) return { success: false as const, error: "Request not found" };
      if (request.recipientId !== user.id) return { success: false as const, error: "You are not authorized to decline this request" };
      if (request.status !== "PENDING") return { success: false as const, error: "This request is no longer pending" };

      await tx.paymentRequest.update({
        where: { id: requestId },
        data: { status: "DECLINED", declinedAt: new Date() },
      });

      logger.info({ requestId, userId: user.id }, "payment_request_declined");
      return { success: true as const };
    },
    { isolationLevel: "Serializable", timeout: 5000 }
  );

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath(`/requests/${requestId}`);
  }
  return result;
}

// ─── Cancel Request (spec § 3.4.5) ───

export async function cancelRequest(requestId: string) {
  const user = await requireAuth();

  const result = await prisma.$transaction(
    async (tx) => {
      const request = await tx.paymentRequest.findUnique({ where: { id: requestId } });

      if (!request) return { success: false as const, error: "Request not found" };
      if (request.senderId !== user.id) return { success: false as const, error: "You are not authorized to cancel this request" };
      if (request.status !== "PENDING") return { success: false as const, error: "This request is no longer pending" };

      await tx.paymentRequest.update({
        where: { id: requestId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });

      logger.info({ requestId, userId: user.id }, "payment_request_cancelled");
      return { success: true as const };
    },
    { isolationLevel: "Serializable", timeout: 5000 }
  );

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath(`/requests/${requestId}`);
  }
  return result;
}
