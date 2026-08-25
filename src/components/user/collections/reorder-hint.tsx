import { HugeiconsIcon } from "@hugeicons/react"
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons"

/**
 * Explains where reordering lives, and — when a sort or search is active — why
 * the handles have disappeared. Only worth showing once there are at least two
 * collections to swap.
 */
export function ReorderHint({
  isReorderable,
  itemCount,
}: {
  isReorderable: boolean
  itemCount: number
}) {
  if (itemCount < 2) return null

  return (
    <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
      <HugeiconsIcon
        icon={DragDropVerticalIcon}
        size={14}
        color="currentColor"
        strokeWidth={2}
        className="shrink-0"
      />
      {isReorderable
        ? "Drag a collection by its handle to reorder it, or use Move up / Move down in its menu."
        : "Switch the sort to “Custom order” to drag collections into place."}
    </p>
  )
}
