import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

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

      <form
        action={async (formData) => {
          "use server";
          const email = formData.get("email") as string;
          await signIn("resend", formData);
          // NextAuth redirects to /verify-request automatically via pages config
          // But we need email in the URL for dev mode magic link display
          redirect(`/verify-request?email=${encodeURIComponent(email)}`);
        }}
      >
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          placeholder="you@example.com"
          className="mb-5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-neutral-800 transition-all duration-200 shadow-sm"
        >
          Continue with Email
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        We&apos;ll send you a magic link to sign in. No password needed.
      </p>

      {process.env.NODE_ENV !== "production" && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-800">
            🧪 Test Mode — Magic link will be shown on the next page. No email sent.
          </p>
        </div>
      )}
    </div>
  );
}
