import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { File01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export function AdminNotesEmptyState({
  hasActiveFilters,
}: {
  hasActiveFilters: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={File01Icon}
          size={20}
          strokeWidth={2}
          className="size-5"
        />
      </div>
      {hasActiveFilters ? (
        <>
          <div>
            <p className="text-sm font-medium text-foreground">
              No notes found
            </p>
            <p className="text-sm text-muted-foreground">
              There are no notes matching your current filters.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/admin/notes" />}
          >
            Clear filters
          </Button>
        </>
      ) : (
        <div>
          <p className="text-sm font-medium text-foreground">
            No notes have been shared yet
          </p>
          <p className="text-sm text-muted-foreground">
            Once contributors upload notes, they will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
