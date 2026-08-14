import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Route } from "next"
import { HugeiconsIcon } from "@hugeicons/react"

export function ContributorPagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number
  totalPages: number
  buildHref: (page: number) => string
}) {
  if (totalPages <= 1) return null

  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <nav
      aria-label="Contributors pagination"
      className="flex items-center justify-center gap-2"
    >
      <Button variant="outline" size="sm" disabled={!hasPrev}>
        {hasPrev ? (
          <Link href={buildHref(page - 1) as Route} aria-label="Previous page">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={21}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
            Previous
          </Link>
        ) : (
          <span aria-disabled="true">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={21}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
            Previous
          </span>
        )}
      </Button>

      <span className="px-2 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      <Button variant="outline" size="sm" disabled={!hasNext}>
        {hasNext ? (
          <Link href={buildHref(page + 1) as Route} aria-label="Next page">
            Next
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={21}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <span aria-disabled="true">
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={21}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
            Next
          </span>
        )}
      </Button>
    </nav>
  )
}
