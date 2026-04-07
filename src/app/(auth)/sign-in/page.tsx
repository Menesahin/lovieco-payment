import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { requestMagicLink } from "@/lib/actions/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const isDev = process.env.NODE_ENV !== "production" || process.env.DEV_MODE === "true";

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-10 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-lg">L</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to LovePay</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email to sign in or create an account
        </p>
      </div>

      <SignInForm onSubmit={requestMagicLink} isDev={isDev} />
    </div>
  );
}
