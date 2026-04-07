import { formatCents } from "@/lib/utils/currency";

export function CurrencyDisplay({
  cents,
  className,
}: {
  cents: number;
  className?: string;
}) {
  return <span className={className}>{formatCents(cents)}</span>;
}
