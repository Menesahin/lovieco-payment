import type { RequestStatus } from "@/generated/prisma/client";

export function requirePending(status: RequestStatus): {
  success: true;
} | { success: false; error: string } {
  if (status !== "PENDING") {
    return { success: false, error: `already_${status.toLowerCase()}` };
  }
  return { success: true };
}
