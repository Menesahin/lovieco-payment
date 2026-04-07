// Next.js 16: proxy.ts replaces middleware.ts (NX-02)
// Must export a named "proxy" function or default export
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/requests", "/settings"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = await auth();
  if (!session?.user) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/requests/:path*", "/settings/:path*"],
};
