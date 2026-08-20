"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PAGE_SIZE_OPTIONS } from "@/types/note"
import { formatExactNumber } from "@/utils/format"
import { buildNotesUrl } from "@/utils/notes-url"
import { Route } from "next"

interface AdminNotesPaginationProps {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/** Windowed page numbers with ellipses, e.g. 1 2 3 … 65 */
function getPageWindow(
  current: number,
  total: number
): (number | "ellipsis")[] {
  const window = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = [...window]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)

  const result: (number | "ellipsis")[] = []
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push("ellipsis")
    result.push(page)
  })
  return result
}

export function AdminNotesPagination({
  pagination,
}: AdminNotesPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { page, pageSize, total, totalPages } = pagination

  if (total === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  function goToPage(nextPage: number) {
    router.push(
      buildNotesUrl({
        current: searchParams,
        updates: { page: String(nextPage) },
      }) as Route
    )
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing {formatExactNumber(start)}–{formatExactNumber(end)} of{" "}
        {formatExactNumber(total)} notes
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) =>
              router.push(
                buildNotesUrl({
                  current: searchParams,
                  updates: { pageSize: v, page: "1" },
                }) as Route
              )
            }
          >
            <SelectTrigger className="h-8 w-17.5" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={16}
              strokeWidth={2}
              className="size-4"
            />
            <span className="sr-only">Previous page</span>
          </Button>

          {getPageWindow(page, totalPages).map((entry, i) =>
            entry === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1.5 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={entry}
                variant={entry === page ? "default" : "outline"}
                size="icon"
                className="size-8"
                aria-current={entry === page ? "page" : undefined}
                onClick={() => goToPage(entry)}
              >
                {entry}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              strokeWidth={2}
              className="size-4"
            />
            <span className="sr-only">Next page</span>
          </Button>
        </nav>
      </div>
    </div>
  )
}
