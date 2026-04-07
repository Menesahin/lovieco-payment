import type { PaymentRequest, User, RequestStatus } from "@prisma/client";
import { formatCents } from "@/lib/utils/currency";

export interface RequestDTO {
  id: string;
  amountCents: number;
  amountFormatted: string;
  note: string | null;
  status: RequestStatus;
  shareableToken: string;
  senderId: string;
  senderName: string | null;
  senderEmail: string;
  recipientId: string | null;
  recipientEmail: string;
  recipientName: string | null;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
  declinedAt: string | null;
  cancelledAt: string | null;
}

type RequestWithRelations = PaymentRequest & {
  sender: Pick<User, "id" | "name" | "email">;
  recipient?: Pick<User, "id" | "name" | "email"> | null;
};

export function toRequestDTO(request: RequestWithRelations): RequestDTO {
  return {
    id: request.id,
    amountCents: request.amountCents,
    amountFormatted: formatCents(request.amountCents),
    note: request.note,
    status: request.status,
    shareableToken: request.shareableToken,
    senderId: request.senderId,
    senderName: request.sender.name,
    senderEmail: request.sender.email,
    recipientId: request.recipientId,
    recipientEmail: request.recipientEmail,
    recipientName: request.recipient?.name ?? null,
    createdAt: request.createdAt.toISOString(),
    expiresAt: request.expiresAt.toISOString(),
    paidAt: request.paidAt?.toISOString() ?? null,
    declinedAt: request.declinedAt?.toISOString() ?? null,
    cancelledAt: request.cancelledAt?.toISOString() ?? null,
  };
}

export interface DashboardFilters {
  status?: RequestStatus;
  query?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  pending: number;
  paid: number;
  declined: number;
  total: number;
}
