import { Skeleton } from "@/components/ui/skeleton"

export default function ContributorsLoading() {
  return (
    <main className="pb-24">
      <section className="py-16 text-center md:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <Skeleton className="mx-auto h-9 w-72 max-w-full" />
          <Skeleton className="mx-auto mt-4 h-5 w-96 max-w-full" />
          <Skeleton className="mx-auto mt-2 h-4 w-64 max-w-full" />
        </div>
      </section>

      <section className="mx-auto grid max-w-3xl grid-cols-1 gap-4 px-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-4">
        <Skeleton className="mx-auto h-6 w-48" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-4">
        <Skeleton className="mx-auto h-6 w-56" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </section>
    </main>
  )
}
