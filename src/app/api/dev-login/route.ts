import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

// DEV ONLY — direct login without magic link
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email param required" }, { status: 400 });
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Auto-create user in dev mode
    user = await prisma.user.create({
      data: { email, name: email.split("@")[0], emailVerified: new Date() },
    });
  }

  // Orphan claim — link unclaimed requests (same as auth.ts signIn event)
  await prisma.paymentRequest.updateMany({
    where: { recipientEmail: email, recipientId: null },
    data: { recipientId: user.id },
  });

  // Create session
  const token = `dev-session-${Date.now()}`;
  await prisma.session.create({
    data: {
      sessionToken: token,
      userId: user.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("authjs.session-token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60,
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
