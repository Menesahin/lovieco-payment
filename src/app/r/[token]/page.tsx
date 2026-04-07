import { notFound } from "next/navigation";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { paymentRequestRepository } from "@/lib/repositories/payment-request.repository";
import { toRequestDTO } from "@/lib/dto/payment-request.dto";
import { markExpiredOnRead } from "@/lib/utils/expiration.server";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default async function ShareableLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const raw = await paymentRequestRepository.getByShareableToken(token);
  if (!raw) notFound();

  const [marked] = await markExpiredOnRead([raw]);
  const request = toRequestDTO(marked);
  const session = await auth();

  // Authenticated and involved → redirect to authenticated detail page
  if (session?.user?.id && (session.user.id === raw.recipientId || session.user.id === raw.senderId)) {
    redirect(`/requests/${raw.id}`);
  }

  // Unauthenticated or not involved → read-only
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8 shadow-sm text-center">
          <h2 className="text-lg font-semibold">Payment Request</h2>
          <p className="mt-4 text-3xl font-bold">{request.amountFormatted}</p>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>From: {request.senderName ?? request.senderEmail}</p>
            {request.note && <p>Note: {request.note}</p>}
            <div className="flex justify-center mt-2">
              <StatusBadge status={request.status} />
            </div>
          </div>
          <div className="mt-6 border-t pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to pay or decline this request.
            </p>
            <Link
              href={`/sign-in?callbackUrl=/r/${token}`}
              className="inline-block w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign in to pay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
