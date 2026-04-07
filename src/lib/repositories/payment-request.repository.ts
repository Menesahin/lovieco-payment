import { prisma } from "@/lib/db";
import { markExpiredOnRead } from "@/lib/utils/expiration.server";
import {
  toRequestDTO,
  type DashboardFilters,
  type DashboardStats,
  type PaginatedResult,
  type RequestDTO,
} from "@/lib/dto/payment-request.dto";
import type { RequestStatus } from "@prisma/client";

const REQUEST_INCLUDE = {
  sender: { select: { id: true, name: true, email: true } },
  recipient: { select: { id: true, name: true, email: true } },
} as const;

function buildSearchWhere(query: string | undefined, field: "sender" | "recipient") {
  if (!query || query.length < 2) return {};
  return {
    [field]: {
      OR: [
        { email: { contains: query, mode: "insensitive" as const } },
        { name: { contains: query, mode: "insensitive" as const } },
      ],
    },
  };
}

export const paymentRequestRepository = {
  async getIncoming(
    userId: string,
    filters: DashboardFilters
  ): Promise<PaginatedResult<RequestDTO>> {
    const where = {
      recipientId: userId,
      ...(filters.status ? { status: filters.status } : {}),
      ...buildSearchWhere(filters.query, "sender"),
    };

    const [requests, total] = await Promise.all([
      prisma.paymentRequest.findMany({
        where,
        include: REQUEST_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.paymentRequest.count({ where }),
    ]);

    const marked = await markExpiredOnRead(requests);

    return {
      data: marked.map(toRequestDTO),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(total / filters.pageSize),
    };
  },

  async getOutgoing(
    userId: string,
    filters: DashboardFilters
  ): Promise<PaginatedResult<RequestDTO>> {
    const where = {
      senderId: userId,
      ...(filters.status ? { status: filters.status } : {}),
      ...buildSearchWhere(filters.query, "recipient"),
    };

    const [requests, total] = await Promise.all([
      prisma.paymentRequest.findMany({
        where,
        include: REQUEST_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.paymentRequest.count({ where }),
    ]);

    const marked = await markExpiredOnRead(requests);

    return {
      data: marked.map(toRequestDTO),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(total / filters.pageSize),
    };
  },

  async getStats(userId: string, tab: "incoming" | "outgoing"): Promise<DashboardStats> {
    const field = tab === "incoming" ? "recipientId" : "senderId";
    const result = await prisma.paymentRequest.groupBy({
      by: ["status"],
      where: { [field]: userId },
      _count: { id: true },
    });

    const counts: Record<string, number> = {};
    let total = 0;
    for (const row of result) {
      counts[row.status] = row._count.id;
      total += row._count.id;
    }

    return {
      pending: counts["PENDING"] ?? 0,
      paid: counts["PAID"] ?? 0,
      declined: (counts["DECLINED"] ?? 0) + (counts["CANCELLED"] ?? 0),
      total,
    };
  },

  async getById(id: string) {
    return prisma.paymentRequest.findUnique({
      where: { id },
      include: REQUEST_INCLUDE,
    });
  },

  async getByShareableToken(token: string) {
    return prisma.paymentRequest.findUnique({
      where: { shareableToken: token },
      include: REQUEST_INCLUDE,
    });
  },

  async create(data: {
    amountCents: number;
    note?: string;
    recipientEmail: string;
    senderId: string;
  }) {
    const recipient = await prisma.user.findUnique({
      where: { email: data.recipientEmail },
    });

    return prisma.paymentRequest.create({
      data: {
        amountCents: data.amountCents,
        note: data.note,
        senderId: data.senderId,
        recipientId: recipient?.id ?? null,
        recipientEmail: data.recipientEmail,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: REQUEST_INCLUDE,
    });
  },
};
