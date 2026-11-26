import { Skeleton } from "@/components/ui/skeleton"

export function NoteCardSkeleton() {
  return (
    <div className="mb-4 flex break-inside-avoid flex-col rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="mt-3 h-5 w-4/5" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/3" />
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="mt-2 h-3 w-24" />
        <div className="mt-3 flex gap-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

/** Grid of skeleton cards for the discovery page's Suspense fallback. */
export function NoteCardSkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {Array.from({ length: count }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function NoteListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="border-t" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="grid gap-x-10 gap-y-4 border-b py-5 md:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="flex min-w-0 flex-col gap-3">
            <Skeleton className="h-5 w-2/5 max-w-md" />
            <Skeleton className="h-4 w-1/3" />
            <div className="mt-1 flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <div className="grid grid-cols-4 gap-x-5 md:flex md:gap-x-6">
              {Array.from({ length: 4 }).map((_, statIndex) => (
                <Skeleton key={statIndex} className="h-9 w-14" />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
