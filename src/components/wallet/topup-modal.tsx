"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toCents, formatCents } from "@/lib/utils/currency";

interface TopupModalProps {
  onTopup: (amountCents: number) => Promise<{ success: boolean; error?: string; newBalance?: number }>;
}

export function TopupModal({ onTopup }: TopupModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    const dollars = parseFloat(amount);
    if (isNaN(dollars) || dollars < 1 || dollars > 10000) {
      toast.error("Enter an amount between $1.00 and $10,000.00");
      return;
    }

    startTransition(async () => {
      const result = await onTopup(toCents(dollars));
      if (result.success) {
        toast.success(`Added ${formatCents(toCents(dollars))} to your wallet`);
        setAmount("");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Top-up failed");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-bold cursor-pointer">
          +
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Add money to your wallet to pay requests.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label htmlFor="topup-amount" className="mb-1.5 block text-sm font-medium">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <input
              id="topup-amount"
              type="number"
              step="0.01"
              min="1"
              max="10000"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border bg-background py-2.5 pl-7 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Min $1.00 · Max $10,000.00</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !amount}>
            {isPending ? <LoadingSpinner className="mr-2" /> : null}
            Add Funds
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
