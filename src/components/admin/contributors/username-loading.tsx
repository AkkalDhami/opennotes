import { Skeleton } from "@/components/ui/skeleton"

export default function ContributorDetailLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-12">
      <Skeleton className="h-4 w-32" />

      <div className="mt-6 flex flex-col items-center gap-3">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className="mt-12">
        <Skeleton className="h-6 w-40" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
