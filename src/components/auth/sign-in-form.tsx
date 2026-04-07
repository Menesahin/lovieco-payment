"use client";

import { useState, useTransition } from "react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface SignInFormProps {
  onSubmit: (email: string) => Promise<{ success: boolean; magicLink?: string; error?: string }>;
  isDev: boolean;
}

export function SignInForm({ onSubmit, isDev }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setMagicLink(null);
    setError(null);

    startTransition(async () => {
      const result = await onSubmit(email);
      if (result.magicLink) {
        setMagicLink(result.magicLink);
      } else if (!result.success) {
        setError(result.error ?? "Something went wrong");
      } else {
        // Production: email sent, show check-email message
        setMagicLink("sent");
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mb-5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-neutral-800 transition-all duration-200 shadow-sm disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner className="h-4 w-4" />
              Sending...
            </span>
          ) : (
            "Continue with Email"
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Dev mode: clickable magic link */}
      {magicLink && magicLink !== "sent" && (
        <div className="mt-5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">🧪</span>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Test Mode
            </span>
          </div>
          <p className="text-xs text-amber-700 mb-3">
            No email sent. Click below to sign in:
          </p>
          <a
            href={magicLink}
            className="block w-full rounded-lg bg-amber-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Sign in as {email} →
          </a>
        </div>
      )}

      {/* Production: check email message */}
      {magicLink === "sent" && (
        <div className="mt-5 rounded-xl bg-stone-50 border border-stone-200 p-5 text-center">
          <p className="text-sm font-medium">Check your email</p>
          <p className="mt-1 text-xs text-muted-foreground">
            We sent a sign-in link to <strong>{email}</strong>
          </p>
        </div>
      )}

      {/* Dev mode hint (before submit) */}
      {isDev && !magicLink && !error && (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          🧪 Test mode — magic link appears here after submit
        </p>
      )}

      {!isDev && !magicLink && (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          We&apos;ll send you a magic link. No password needed.
        </p>
      )}
    </div>
  );
}
