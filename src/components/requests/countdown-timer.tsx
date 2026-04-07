"use client";

import { useEffect, useState } from "react";
import { getTimeRemaining, getExpirationPercentage } from "@/lib/utils/expiration";

export function CountdownTimer({
  expiresAt,
  createdAt,
}: {
  expiresAt: string;
  createdAt: string;
}) {
  // Initialize with null to avoid hydration mismatch (Date.now() differs server/client)
  const [remaining, setRemaining] = useState<ReturnType<typeof getTimeRemaining> | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      setRemaining(getTimeRemaining(new Date(expiresAt)));
      setPercentage(getExpirationPercentage(new Date(createdAt), new Date(expiresAt)));
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [expiresAt, createdAt]);

  // Show nothing on first server render to prevent hydration mismatch
  if (remaining === null || percentage === null) {
    return (
      <div className="h-8 animate-pulse rounded bg-muted" />
    );
  }

  if (remaining.expired) {
    return (
      <div className="text-sm text-red-600 font-medium">
        This request has expired
      </div>
    );
  }

  const barColor =
    percentage > 86 ? "bg-red-500" : percentage > 43 ? "bg-amber-500" : "bg-green-500";

  const timeText =
    remaining.days > 0
      ? `${remaining.days}d ${remaining.hours}h remaining`
      : remaining.hours > 0
      ? `${remaining.hours}h ${remaining.minutes}m remaining`
      : `${remaining.minutes}m remaining`;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span>Expires in: {timeText}</span>
        <span>{Math.round(percentage)}% elapsed</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}
