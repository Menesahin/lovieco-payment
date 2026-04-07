"use client";

import { useActionState, useState } from "react";
import { toCents } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

// Server action passed as prop from page.tsx to avoid Turbopack node:module bundling (NX-11)
interface CreateRequestFormProps {
  onSubmit: (formData: FormData) => Promise<unknown>;
}

export function CreateRequestForm({ onSubmit }: CreateRequestFormProps) {
  const [amount, setAmount] = useState("");
  const [noteLen, setNoteLen] = useState(0);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const dollars = parseFloat(formData.get("amount") as string);
      if (isNaN(dollars) || dollars <= 0) {
        return { success: false, fieldErrors: { amountCents: ["Please enter a valid amount"] } };
      }
      formData.set("amountCents", String(toCents(dollars)));
      return onSubmit(formData);
    },
    null
  );

  const stateObj = state as Record<string, unknown> | null;
  const fieldErrors = stateObj?.fieldErrors as Record<string, string[]> | undefined;
  const error = stateObj?.error as string | undefined;

  return (
    <form action={formAction} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error as string}
        </div>
      )}

      <div>
        <label htmlFor="recipientEmail" className="mb-1.5 block text-sm font-medium">
          Recipient Email <span className="text-destructive">*</span>
        </label>
        <input
          id="recipientEmail"
          name="recipientEmail"
          type="email"
          required
          placeholder="recipient@example.com"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
        {fieldErrors?.recipientEmail && (
          <p className="mt-1 text-xs text-destructive">{fieldErrors.recipientEmail[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="mb-1.5 block text-sm font-medium">
          Amount <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            max="100000"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border bg-background py-2.5 pl-7 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        {fieldErrors?.amountCents && (
          <p className="mt-1 text-xs text-destructive">{fieldErrors.amountCents[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
          Note <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={500}
          placeholder="Dinner last Friday..."
          onChange={(e) => setNoteLen(e.target.value.length)}
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
        <p className="mt-1 text-xs text-muted-foreground">{noteLen}/500 characters</p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <LoadingSpinner className="mr-2" />
            Sending...
          </>
        ) : (
          "Send Payment Request"
        )}
      </Button>
    </form>
  );
}
