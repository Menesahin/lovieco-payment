import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { paymentRequestRepository } from "@/lib/repositories/payment-request.repository";

export default async function ShareableLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const raw = await paymentRequestRepository.getByShareableToken(token);
  if (!raw) notFound();

  const session = await auth();

  // Not logged in → show sign-in prompt (no payment details revealed)
  if (!session?.user?.id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Payment Request</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Someone sent you a payment request. Sign in to view the details and take action.
          </p>
          <Link
            href={`/sign-in?callbackUrl=/r/${token}`}
            className="mt-6 block w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-neutral-800 transition-all shadow-sm"
          >
            Sign in to continue
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            Don&apos;t have an account? Enter your email and one will be created automatically.
          </p>
        </div>
      </div>
    );
  }

  // Logged in + involved → go to detail page
  if (session.user.id === raw.senderId || session.user.id === raw.recipientId) {
    redirect(`/requests/${raw.id}`);
  }

  // Logged in but not involved → friendly message
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-stone-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Access Restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This payment request is not addressed to your account. If you believe this is a mistake, contact the sender.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 block w-full rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium hover:bg-stone-50 transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
