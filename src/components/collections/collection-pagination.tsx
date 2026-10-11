import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Route } from "next";

// Server component: plain links, so every page is crawlable, shareable and refresh-safe.
export function CollectionPagination({
  page,
  totalPages,
  params,
}: {
  page: number
  totalPages: number
  params: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null
  const href = (p: number) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    p > 1 ? q.set("page", String(p)) : q.delete("page")
    const s = q.toString()
    return s ? `/collections?${s}` : "/collections"
  }
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
    >
      {page > 1 && (
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link href={href(page - 1) as Route} rel="prev">
              Previous
            </Link>
          }
        />
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 && (
            <span aria-hidden className="text-muted-foreground">
              …
            </span>
          )}
          <Button
            variant={p === page ? "default" : "ghost"}
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={href(p) as Route}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </Link>
            }
          />
        </span>
      ))}
      {page < totalPages && (
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link href={href(page + 1) as Route} rel="next">
              Next
            </Link>
          }
        />
      )}
    </nav>
  )
}
