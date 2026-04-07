import { requireAuth } from "@/lib/guards/require-auth";

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <div className="mt-6 rounded-xl border bg-card p-6">
        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{user.name ?? "Not set"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
