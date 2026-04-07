"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProfileFormProps {
  currentName: string;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function ProfileForm({ currentName, onSubmit }: ProfileFormProps) {
  const [name, setName] = useState(currentName);
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await onSubmit(formData);
      if (result.success) {
        toast.success("Profile updated");
      } else {
        toast.error(result.error ?? "Update failed");
      }
      return result;
    },
    null
  );

  const hasChanged = name !== currentName;

  return (
    <form action={formAction}>
      <label htmlFor="name" className="mb-2 block text-sm font-medium">
        Display Name
      </label>
      <div className="flex gap-3">
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
        />
        <Button type="submit" disabled={isPending || !hasChanged} size="sm" className="rounded-xl px-5">
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
