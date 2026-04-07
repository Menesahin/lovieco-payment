import { requireAuth } from "@/lib/guards/require-auth";
import { walletRepository } from "@/lib/repositories/wallet.repository";
import { formatCents } from "@/lib/utils/currency";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/settings/profile-form";
import { updateProfile } from "@/lib/actions/settings";
import { signOut } from "@/auth";
import Link from "next/link";
import { User, Wallet, Shield, LogOut } from "lucide-react";

export default async function SettingsPage() {
  const sessionUser = await requireAuth();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  const wallet = await walletRepository.getOrCreateWallet(sessionUser.id);

  const initial = (user?.name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      {/* Profile */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile</h2>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 border border-stone-300/50 flex items-center justify-center">
            <span className="text-lg font-semibold text-stone-600">{initial}</span>
          </div>
          <div>
            <p className="font-medium">{user?.name ?? "No name set"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <ProfileForm currentName={user?.name ?? ""} onSubmit={updateProfile} />
      </div>

      {/* Wallet */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Wallet</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold font-mono tracking-tight">{formatCents(wallet.balanceCents)}</p>
          </div>
          <Link
            href="/wallet"
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-all duration-200 active:scale-[0.98]"
          >
            View Wallet
          </Link>
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account</h2>
        </div>
        <div className="space-y-3 text-sm">
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
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200/80 bg-red-50/30 p-6">
        <div className="flex items-center gap-2 mb-4">
          <LogOut className="h-4 w-4 text-red-600" />
          <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wider">Danger Zone</h2>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-all duration-200 active:scale-[0.98]"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
