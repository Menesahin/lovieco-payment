import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function VerifyRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email;

  // In test/dev mode, fetch the latest verification token from DB and show the magic link
  let magicLink: string | null = null;
  if (process.env.NODE_ENV !== "production" && email) {
    const token = await prisma.verificationToken.findFirst({
      where: { identifier: email },
      orderBy: { expires: "desc" },
    });

    if (token) {
      const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
      magicLink = `${baseUrl}/api/auth/callback/resend?token=${encodeURIComponent(token.token)}&email=${encodeURIComponent(email)}`;
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-10 shadow-sm text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
        We sent a sign-in link to{" "}
        {email ? <strong className="text-foreground">{email}</strong> : "your email"}.
        Click the link to continue.
      </p>

      {/* TEST MODE: Show magic link */}
      {magicLink && (
        <div className="mt-6 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-5 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">🧪</span>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Test Mode — Magic Link
            </span>
          </div>
          <p className="text-xs text-amber-700 mb-3">
            In production, this link would be sent via email. For testing, click below:
          </p>
          <Link
            href={magicLink}
            className="block w-full rounded-lg bg-amber-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Click here to sign in →
          </Link>
          <p className="mt-3 text-[10px] text-amber-600 break-all font-mono leading-relaxed">
            {magicLink}
          </p>
        </div>
      )}

      {!magicLink && (
        <div className="mt-6 rounded-xl bg-stone-50 p-4">
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-2">
              try again
            </Link>.
          </p>
        </div>
      )}
    </div>
  );
}
