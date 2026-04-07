import { Skeleton } from "@/components/ui/skeleton";

export default function RequestDetailLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-12 rounded-lg" />
    </div>
  );
}
