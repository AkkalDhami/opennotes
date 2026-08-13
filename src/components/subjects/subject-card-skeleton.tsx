import { Skeleton } from "@/components/ui/skeleton";

export function SubjectCardSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-11 shrink-0 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
      <Skeleton className="size-4 shrink-0 rounded-full" />
    </div>
  );
}
