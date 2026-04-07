import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const isDev = process.env.NODE_ENV !== "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: "LovePay <onboarding@resend.dev>",
      // In dev mode: skip actual email sending, just create token in DB
      ...(isDev
        ? {
            sendVerificationRequest: async ({ identifier: email, url, token }) => {
              logger.info({ email, token: token.substring(0, 8) + "..." }, "dev_magic_link_created");
              // Token is already saved to DB by NextAuth adapter
              // User will see it on /verify-request page
            },
          }
        : {}),
    }),
    // Test-only: bypass magic link for E2E tests (ADR-007)
    ...(process.env.NODE_ENV === "test"
      ? [
          Credentials({
            id: "test-credentials",
            credentials: { email: { type: "email" } },
            async authorize(credentials) {
              const email = credentials.email as string;
              let user = await prisma.user.findUnique({
                where: { email },
              });
              if (!user) {
                user = await prisma.user.create({
                  data: { email, name: email.split("@")[0] },
                });
              }
              return user;
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/verify-request",
    error: "/error",
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id && user.email) {
        const result = await prisma.paymentRequest.updateMany({
          where: {
            recipientEmail: user.email,
            recipientId: null,
          },
          data: {
            recipientId: user.id,
          },
        });
        if (result.count > 0) {
          logger.info(
            { userId: user.id, claimedCount: result.count },
            "orphan_requests_claimed"
          );
        }
      }
    },
  },
});
