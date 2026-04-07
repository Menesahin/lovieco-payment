// Server-only expiration utility — uses Prisma (ADR-003: check-on-read)
import "server-only";
import { prisma } from "@/lib/db";
import type { PaymentRequest } from "@prisma/client";
import { isExpired } from "./expiration";

export async function markExpiredOnRead<
  T extends Pick<PaymentRequest, "id" | "status" | "expiresAt">,
>(requests: T[]): Promise<T[]> {
  const expiredIds = requests
    .filter((r) => r.status === "PENDING" && isExpired(r.expiresAt))
    .map((r) => r.id);

  if (expiredIds.length > 0) {
    await prisma.paymentRequest.updateMany({
      where: { id: { in: expiredIds }, status: "PENDING" },
      data: { status: "EXPIRED" },
    });
  }

  return requests.map((r) =>
    expiredIds.includes(r.id) ? { ...r, status: "EXPIRED" as const } : r
  );
}
