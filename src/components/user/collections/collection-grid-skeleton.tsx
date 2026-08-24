import { Skeleton } from "@/components/ui/skeleton"

export function CollectionGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between">
            <Skeleton className="size-12 rounded-xl" />
            <Skeleton className="size-8 rounded" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}
