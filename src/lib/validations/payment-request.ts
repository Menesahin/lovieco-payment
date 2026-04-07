import { z } from "zod";

export const createRequestSchema = z.object({
  recipientEmail: z
    .string()
    .min(1, "Recipient email is required")
    .email("Please enter a valid email address")
    .max(254),
  amountCents: z
    .number()
    .int("Amount must be whole cents")
    .min(1, "Amount must be at least $0.01")
    .max(10_000_000, "Amount cannot exceed $100,000.00"),
  note: z
    .string()
    .max(500, "Note must be 500 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
