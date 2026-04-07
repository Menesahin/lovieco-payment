import type { Wallet, Transaction, TransactionType } from "@prisma/client";
import { formatCents } from "@/lib/utils/currency";

export interface WalletDTO {
  balanceCents: number;
  balanceFormatted: string;
}

export interface TransactionDTO {
  id: string;
  type: TransactionType;
  amountCents: number;
  amountFormatted: string;
  balanceAfter: number;
  balanceAfterFormatted: string;
  description: string;
  createdAt: string;
}

export function toWalletDTO(wallet: Wallet | null): WalletDTO {
  const balanceCents = wallet?.balanceCents ?? 0;
  return {
    balanceCents,
    balanceFormatted: formatCents(balanceCents),
  };
}

export function toTransactionDTO(tx: Transaction): TransactionDTO {
  return {
    id: tx.id,
    type: tx.type,
    amountCents: tx.amountCents,
    amountFormatted: `${tx.amountCents >= 0 ? "+" : ""}${formatCents(Math.abs(tx.amountCents))}`,
    balanceAfter: tx.balanceAfter,
    balanceAfterFormatted: formatCents(tx.balanceAfter),
    description: tx.description,
    createdAt: tx.createdAt.toISOString(),
  };
}
