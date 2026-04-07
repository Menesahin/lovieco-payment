import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const isDev = process.env.NODE_ENV !== "production" || process.env.DEV_MODE === "true";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: "LovePay <onboarding@resend.dev>",
      // Dev mode: skip email, store the raw token + callback URL for UI display
      ...(isDev
        ? {
            sendVerificationRequest: async ({ identifier: email, url }) => {
              // Store the full callback URL in a temp table-like approach
              // We use VerificationToken's identifier field trick: store URL as a separate record
              await prisma.verificationToken.create({
                data: {
                  identifier: `dev_url:${email}`,
                  token: url,
                  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                },
              });
              logger.info({ email }, "dev_magic_link_created");
            },
          }
        : {}),
    }),
    ...(process.env.NODE_ENV === "test"
      ? [
          Credentials({
            id: "test-credentials",
            credentials: { email: { type: "email" } },
            async authorize(credentials) {
              const email = credentials.email as string;
              let user = await prisma.user.findUnique({ where: { email } });
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
          where: { recipientEmail: user.email, recipientId: null },
          data: { recipientId: user.id },
        });
        if (result.count > 0) {
          logger.info({ userId: user.id, claimedCount: result.count }, "orphan_requests_claimed");
        }
      }
    },
  },
});
