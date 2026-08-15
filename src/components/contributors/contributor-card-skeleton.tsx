import { Skeleton } from "@/components/ui/skeleton";

export function ContributorCardSkeleton() {
  return (
    <div
      className="flex min-w-60 flex-col items-center gap-3 rounded-xl border border-border bg-card p-6"
      aria-hidden="true"
    >
      <Skeleton className="size-22 rounded-full" />
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3.5 w-20" />
      </div>
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-3.5 w-20" />
    </div>
  );
}
