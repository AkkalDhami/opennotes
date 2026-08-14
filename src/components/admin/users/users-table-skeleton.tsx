import { Skeleton } from "@/components/ui/skeleton";

export function UsersTableSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-32" />

      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-full sm:max-w-sm" />
        <Skeleton className="h-10 w-full sm:w-40" />
        <Skeleton className="h-10 w-full sm:w-48" />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="border-b border-border bg-muted/30 px-4 py-2.5">
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="hidden h-4 w-24 sm:block" />
            <Skeleton className="hidden h-4 w-40 md:block" />
            <Skeleton className="ml-auto h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-48" />
      </div>
    </div>
  );
}
