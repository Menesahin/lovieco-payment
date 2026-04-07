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
import { Plus, DollarSign } from "lucide-react";

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
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.95] cursor-pointer">
          <Plus className="h-4 w-4" />
        </span>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Add money to your wallet to pay requests.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label htmlFor="topup-amount" className="mb-2 block text-sm font-medium">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
            </span>
            <input
              id="topup-amount"
              type="number"
              step="0.01"
              min="1"
              max="10000"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm font-mono outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Min $1.00 · Max $10,000.00</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !amount} className="rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            {isPending ? <LoadingSpinner className="mr-2" /> : null}
            Add Funds
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
