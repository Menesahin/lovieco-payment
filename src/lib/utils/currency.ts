// ADR-002: All money stored as integer cents. Display conversion only here.

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}
