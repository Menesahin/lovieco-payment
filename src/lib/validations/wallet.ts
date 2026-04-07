import { z } from "zod";

export const topupSchema = z.object({
  amountCents: z
    .number()
    .int()
    .min(100, "Minimum top-up is $1.00")
    .max(1_000_000, "Maximum top-up is $10,000.00"),
});
