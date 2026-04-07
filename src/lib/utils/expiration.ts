// Client-safe expiration utilities — no Prisma, no server-only imports

export function isExpired(expiresAt: Date): boolean {
  return expiresAt < new Date();
}

export function getTimeRemaining(expiresAt: Date): {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
  expired: boolean;
} {
  const totalMs = expiresAt.getTime() - Date.now();
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, totalMs: 0, expired: true };
  }
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, totalMs, expired: false };
}

export function getExpirationPercentage(
  createdAt: Date,
  expiresAt: Date
): number {
  const total = expiresAt.getTime() - createdAt.getTime();
  const elapsed = Date.now() - createdAt.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
