import "server-only";
import { prisma } from "@/lib/db";
import { markExpiredOnRead } from "@/lib/utils/expiration.server";
import { formatCents } from "@/lib/utils/currency";

export type ActivityType =
  | "request_incoming"
  | "request_outgoing"
  | "payment_sent"
  | "payment_received"
  | "topup";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  amountCents: number;
  amountFormatted: string;
  status: string | null;
  requestId: string | null;
  createdAt: string;
  // For actionable items (pending incoming requests)
  actionable: boolean;
  counterpartyName: string | null;
  counterpartyEmail: string | null;
}

export const activityRepository = {
  async getFeed(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ data: ActivityItem[]; total: number; page: number; pageSize: number; totalPages: number }> {
    // Fetch requests where user is sender or recipient
    const [requests, transactions] = await Promise.all([
      prisma.paymentRequest.findMany({
        where: {
          OR: [{ senderId: userId }, { recipientId: userId }],
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          recipient: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Mark expired on read
    await markExpiredOnRead(requests);

    // Build unified activity feed
    const activities: ActivityItem[] = [];

    // Add requests
    for (const req of requests) {
      const isSender = req.senderId === userId;
      const counterparty = isSender
        ? req.recipient ?? { name: null, email: req.recipientEmail }
        : req.sender;

      activities.push({
        id: `req_${req.id}`,
        type: isSender ? "request_outgoing" : "request_incoming",
        title: isSender
          ? `You requested ${formatCents(req.amountCents)} from ${counterparty.name ?? counterparty.email}`
          : `${counterparty.name ?? counterparty.email} requested ${formatCents(req.amountCents)}`,
        description: req.note,
        amountCents: isSender ? req.amountCents : -req.amountCents,
        amountFormatted: formatCents(req.amountCents),
        status: req.status,
        requestId: req.id,
        createdAt: req.createdAt.toISOString(),
        actionable: !isSender && req.status === "PENDING" && req.expiresAt > new Date(),
        counterpartyName: counterparty.name ?? null,
        counterpartyEmail: counterparty.email,
      });
    }

    // Add transactions (topups only — payments are already shown as requests)
    for (const tx of transactions) {
      if (tx.type === "TOPUP") {
        activities.push({
          id: `tx_${tx.id}`,
          type: "topup",
          title: `Added ${formatCents(tx.amountCents)} to wallet`,
          description: tx.description,
          amountCents: tx.amountCents,
          amountFormatted: `+${formatCents(tx.amountCents)}`,
          status: null,
          requestId: null,
          createdAt: tx.createdAt.toISOString(),
          actionable: false,
          counterpartyName: null,
          counterpartyEmail: null,
        });
      }
    }

    // Sort by date descending
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = activities.length;
    const start = (page - 1) * pageSize;
    const paged = activities.slice(start, start + pageSize);

    return {
      data: paged,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async getQuickStats(userId: string) {
    const [pendingIncoming, totalPaid, walletResult] = await Promise.all([
      prisma.paymentRequest.count({
        where: { recipientId: userId, status: "PENDING" },
      }),
      prisma.paymentRequest.count({
        where: {
          OR: [{ senderId: userId }, { recipientId: userId }],
          status: "PAID",
        },
      }),
      prisma.wallet.findUnique({ where: { userId } }),
    ]);

    return {
      balance: walletResult?.balanceCents ?? 0,
      pendingActions: pendingIncoming,
      completedPayments: totalPaid,
    };
  },
};
