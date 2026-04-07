import { isExpired } from "@/lib/utils/expiration";

export function requireNotExpired(expiresAt: Date): {
  success: true;
} | { success: false; error: string } {
  if (isExpired(expiresAt)) {
    return { success: false, error: "expired" };
  }
  return { success: true };
}
