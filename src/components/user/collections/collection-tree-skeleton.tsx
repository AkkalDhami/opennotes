import { Skeleton } from "@/components/ui/skeleton"

export function CollectionTreeSkeleton() {
  const rows = [0, 24, 24, 0, 0]
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {rows.map((indent, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3"
          style={{ paddingLeft: 16 + indent }}
        >
          <Skeleton className="h-6 w-6 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="hidden h-4 w-24 sm:block" />
        </div>
      ))}
    </div>
  )
}
