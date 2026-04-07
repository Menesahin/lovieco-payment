export function requireRecipient(
  recipientId: string | null,
  userId: string
): { success: true } | { success: false; error: string } {
  if (recipientId !== userId) {
    return { success: false, error: "unauthorized" };
  }
  return { success: true };
}

export function requireSender(
  senderId: string,
  userId: string
): { success: true } | { success: false; error: string } {
  if (senderId !== userId) {
    return { success: false, error: "unauthorized" };
  }
  return { success: true };
}
