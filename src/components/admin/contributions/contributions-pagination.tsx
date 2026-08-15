import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Route } from "next"

export function ContributionsPagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  function hrefForPage(targetPage: number) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value)
    }
    if (targetPage > 1) params.set("page", String(targetPage))
    const query = params.toString()
    return query ? `/admin/contributions?${query}` : "/admin/contributions"
  }

  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          nativeButton={false}
          render={
            <Link
              href={hrefForPage(Math.max(1, page - 1)) as Route}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={16}
                strokeWidth={2}
                className="size-4"
                aria-hidden="true"
              />
              Previous
            </Link>
          }
          variant="outline"
          size="sm"
          disabled={page <= 1}
        ></Button>
        <Button
          nativeButton={false}
          render={
            <Link
              href={hrefForPage(Math.min(totalPages, page + 1)) as Route}
              aria-disabled={page >= totalPages}
              tabIndex={page >= totalPages ? -1 : undefined}
            >
              Next
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                strokeWidth={2}
                className="size-4"
                aria-hidden="true"
              />
            </Link>
          }
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
        ></Button>
      </div>
    </div>
  )
}
