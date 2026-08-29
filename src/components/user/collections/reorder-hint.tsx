import { HugeiconsIcon } from "@hugeicons/react"
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons"

export function ReorderHint({
  isReorderable,
  itemCount,
}: {
  isReorderable: boolean
  itemCount: number
}) {
  if (itemCount < 2) return null

  return (
    <p className="mb-6 flex gap-1.5 text-xs text-muted-foreground">
      <HugeiconsIcon
        icon={DragDropVerticalIcon}
        size={14}
        color="currentColor"
        strokeWidth={2}
        className="mt-0.5 shrink-0"
      />
      {isReorderable
        ? "Drag a collection by its handle to reorder it, or use Move up / Move down in its menu."
        : "Switch the sort to “Custom order” to drag collections into place."}
    </p>
  )
}
