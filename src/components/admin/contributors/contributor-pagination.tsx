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
      className="flex w-full items-center justify-center gap-2"
    >
      {hasPrev ? (
        <Button
          variant="outline"
          disabled={!hasPrev}
          nativeButton={false}
          render={
            <Link
              href={buildHref(page - 1) as Route}
              aria-label="Previous page"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={21}
                strokeWidth={2}
                className="size-4"
                aria-hidden="true"
              />
              Previous
            </Link>
          }
        ></Button>
      ) : (
        <Button
          variant="outline"
          disabled={!hasPrev}
          nativeButton={false}
          render={
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
          }
        ></Button>
      )}

      <span className="px-2 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      {hasNext ? (
        <Button
          variant="outline"
          disabled={!hasNext}
          nativeButton={false}
          render={
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
          }
        ></Button>
      ) : (
        <Button
          variant="outline"
          nativeButton={false}
          render={
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
          }
          disabled={!hasNext}
        ></Button>
      )}
    </nav>
  )
}
