"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/guards/require-auth";
import { topupSchema } from "@/lib/validations/wallet";
import { logger } from "@/lib/logger";

export async function topupWallet(amountCents: number) {
  const user = await requireAuth();

  const parsed = topupSchema.safeParse({ amountCents });
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { userId: user.id },
        create: { userId: user.id, balanceCents: parsed.data.amountCents },
        update: { balanceCents: { increment: parsed.data.amountCents } },
      });

      await tx.transaction.create({
        data: {
          type: "TOPUP",
          amountCents: parsed.data.amountCents,
          balanceAfter: wallet.balanceCents,
          description: "Funds added",
          userId: user.id,
        },
      });

      logger.info(
        { userId: user.id, amount: parsed.data.amountCents, newBalance: wallet.balanceCents },
        "wallet_topup"
      );

      return { success: true as const, newBalance: wallet.balanceCents };
    },
    { isolationLevel: "Serializable", timeout: 5000 }
  );

  revalidatePath("/", "layout");
  return result;
}
