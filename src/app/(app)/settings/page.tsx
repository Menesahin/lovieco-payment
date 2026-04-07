import { requireAuth } from "@/lib/guards/require-auth";
import { walletRepository } from "@/lib/repositories/wallet.repository";
import { formatCents } from "@/lib/utils/currency";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/settings/profile-form";
import { updateProfile } from "@/lib/actions/settings";
import { signOut } from "@/auth";
import Link from "next/link";

export default async function SettingsPage() {
  const sessionUser = await requireAuth();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  const wallet = await walletRepository.getOrCreateWallet(sessionUser.id);

  const initial = (user?.name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight mb-5">Settings</h1>

      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-sm divide-y divide-stone-100">
        {/* Profile */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 border border-stone-300/50 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-stone-600">{initial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name ?? "No name set"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <ProfileForm currentName={user?.name ?? ""} onSubmit={updateProfile} />
        </div>

        {/* Wallet */}
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-lg font-bold font-mono">{formatCents(wallet.balanceCents)}</p>
          </div>
          <Link
            href="/wallet"
            className="rounded-lg border border-stone-300 px-3.5 py-1.5 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            View Wallet
          </Link>
        </div>

        {/* Account info */}
        <div className="p-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : "—"}
            </span>
          </div>
        </div>

        {/* Sign out */}
        <div className="p-5">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-red-300 px-3.5 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
