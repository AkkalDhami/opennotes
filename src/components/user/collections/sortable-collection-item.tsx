"use client"

import { useCallback, useRef, type ReactNode } from "react"
import { useDrag, useDrop } from "react-dnd"

import type { CollectionDragItem, DragConnectorRef } from "./collection-dnd"

interface SortableCollectionItemProps {
  id: string
  index: number
  /** Drag type, scoped per sibling group by `collectionDragType`. */
  type: string
  /** `false` when the list isn't showing its stored order (a sort or a search). */
  canDrag: boolean
  /** Rows swap on the vertical midpoint; cards flow in rows, so they use the horizontal one. */
  orientation: "vertical" | "horizontal"
  onMove: (fromIndex: number, toIndex: number) => void
  onDrop: () => void
  children: (state: {
    /**
     * Attach to the element that should be measured, act as the drop target,
     * and be used as the drag preview. No wrapper element is rendered so the
     * consumer keeps full control of its own markup and ARIA roles.
     */
    itemRef: DragConnectorRef
    /** Attach to the grip handle — only this element starts a drag. */
    dragRef: DragConnectorRef
    isDragging: boolean
  }) => ReactNode
}

/**
 * One draggable, droppable position in a sibling group.
 *
 * Uses react-dnd's hover-swap pattern: the list reorders continuously while the
 * pointer moves and only writes to the server on drop. `item.index` is mutated
 * inside `hover` on purpose — it's the monitor's live copy, and without that
 * write every later hover would compute its swap from the index the item had
 * when the drag began.
 *
 * The item is the drop target and the drag preview, but only the grip handle is
 * the drag source, so the links and actions menu inside stay clickable.
 */
export function SortableCollectionItem({
  id,
  index,
  type,
  canDrag,
  orientation,
  onMove,
  onDrop,
  children,
}: SortableCollectionItemProps) {
  const elementRef = useRef<HTMLElement | null>(null)

  const [, drop] = useDrop<CollectionDragItem, void, unknown>({
    accept: type,
    hover(item, monitor) {
      const element = elementRef.current
      if (!element) return

      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return

      const rect = element.getBoundingClientRect()
      const pointer = monitor.getClientOffset()
      if (!pointer) return

      // Only swap once the pointer has crossed the midpoint of the hovered
      // item, otherwise the two items flicker back and forth while the cursor
      // sits on the boundary between them.
      if (orientation === "vertical") {
        const middle = (rect.bottom - rect.top) / 2
        const offset = pointer.y - rect.top
        if (dragIndex < hoverIndex && offset < middle) return
        if (dragIndex > hoverIndex && offset > middle) return
      } else {
        const middle = (rect.right - rect.left) / 2
        const offset = pointer.x - rect.left
        if (dragIndex < hoverIndex && offset < middle) return
        if (dragIndex > hoverIndex && offset > middle) return
      }

      onMove(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
    // No `drop` handler: the source's `end` already fires for every release,
    // valid target or not, and handling both would commit twice.
  })

  const [{ isDragging }, drag, preview] = useDrag<
    CollectionDragItem,
    void,
    { isDragging: boolean }
  >({
    type,
    item: () => ({ id, index }),
    canDrag: () => canDrag,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end() {
      // Fires even when the pointer is released outside a valid target. The
      // hover swaps have already happened by then, so the user's intent is on
      // screen either way — persist it rather than snapping back.
      onDrop()
    },
  })

  const itemRef = useCallback<DragConnectorRef>(
    (element) => {
      elementRef.current = element
      drop(element)
      preview(element)
    },
    [drop, preview]
  )

  const dragRef = useCallback<DragConnectorRef>(
    (element) => {
      drag(element)
    },
    [drag]
  )

  // eslint-disable-next-line react-hooks/refs
  return <>{children({ itemRef, dragRef, isDragging })}</>
}
