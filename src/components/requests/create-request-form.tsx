"use client";

import { useActionState, useState } from "react";
import { toCents, formatCents } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

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
  const parsedAmount = parseFloat(amount);
  const preview = !isNaN(parsedAmount) && parsedAmount > 0 ? formatCents(toCents(parsedAmount)) : null;

  return (
    <form action={formAction} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Recipient */}
      <div>
        <label htmlFor="recipientEmail" className="mb-2 block text-sm font-medium">
          Recipient Email <span className="text-red-500">*</span>
        </label>
        <input
          id="recipientEmail"
          name="recipientEmail"
          type="email"
          required
          placeholder="recipient@example.com"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
        />
        {fieldErrors?.recipientEmail && (
          <p className="mt-1.5 text-xs text-red-600">{fieldErrors.recipientEmail[0]}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="mb-2 block text-sm font-medium">
          Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
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
            className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-8 pr-4 text-sm font-mono outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
          />
        </div>
        {fieldErrors?.amountCents && (
          <p className="mt-1.5 text-xs text-red-600">{fieldErrors.amountCents[0]}</p>
        )}
      </div>

      {/* Note */}
      <div>
        <label htmlFor="note" className="mb-2 block text-sm font-medium">
          Note <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={500}
          placeholder="What's this for?"
          onChange={(e) => setNoteLen(e.target.value.length)}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
        />
        <p className="mt-1 text-xs text-muted-foreground text-right">{noteLen}/500</p>
      </div>

      {/* Preview */}
      {preview && (
        <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">You&apos;re requesting</p>
          <p className="text-2xl font-bold font-mono">{preview}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full rounded-xl py-3 text-sm shadow-sm"
        disabled={isPending}
      >
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
