import "server-only";
import { prisma } from "@/lib/db";
import { toTransactionDTO, type TransactionDTO } from "@/lib/dto/wallet.dto";
import type { PaginatedResult } from "@/lib/dto/payment-request.dto";

export const walletRepository = {
  async getOrCreateWallet(userId: string) {
    return prisma.wallet.upsert({
      where: { userId },
      create: { userId, balanceCents: 0 },
      update: {},
    });
  },

  async getTransactions(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<TransactionDTO>> {
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      data: transactions.map(toTransactionDTO),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
};
