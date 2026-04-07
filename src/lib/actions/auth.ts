"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/db";

export async function requestMagicLink(email: string): Promise<{ success: boolean; magicLink?: string; error?: string }> {
  try {
    await signIn("resend", { email, redirect: false });
  } catch {
    // signIn may throw on redirect — ignore
  }

  // In dev mode, retrieve the stored callback URL
  if (process.env.NODE_ENV !== "production") {
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: `dev_url:${email}` },
      orderBy: { expires: "desc" },
    });

    if (record) {
      // Clean up
      await prisma.verificationToken.deleteMany({
        where: { identifier: `dev_url:${email}` },
      });
      return { success: true, magicLink: record.token };
    }
  }

  return { success: true };
}
