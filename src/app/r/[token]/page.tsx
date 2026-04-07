import { notFound, redirect } from "next/navigation";
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

  // Not logged in → redirect to sign-in with callback
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/r/${token}`);
  }

  // Logged in + involved (sender or recipient) → redirect to detail page
  if (session.user.id === raw.senderId || session.user.id === raw.recipientId) {
    redirect(`/requests/${raw.id}`);
  }

  // Logged in but NOT involved → 404 (don't reveal existence)
  notFound();
}
