import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/guards/require-auth";
import { paymentRequestRepository } from "@/lib/repositories/payment-request.repository";
import { toRequestDTO } from "@/lib/dto/payment-request.dto";
import { markExpiredOnRead } from "@/lib/utils/expiration.server";
import { RequestDetail } from "@/components/requests/request-detail";
import { payRequest, declineRequest, cancelRequest } from "@/lib/actions/payment-request";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const raw = await paymentRequestRepository.getById(id);
  if (!raw) notFound();
  if (raw.senderId !== user.id && raw.recipientId !== user.id) notFound();

  const [marked] = await markExpiredOnRead([raw]);
  const request = toRequestDTO(marked);
  const role = raw.senderId === user.id ? "sender" : "recipient";

  return (
    <RequestDetail
      request={request}
      role={role}
      onPay={payRequest}
      onDecline={declineRequest}
      onCancel={cancelRequest}
    />
  );
}
