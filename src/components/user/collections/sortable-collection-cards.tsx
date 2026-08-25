"use client"

import type { CollectionTreeNode } from "@/lib/user/collection-queries"

import { CollectionCard } from "./collection-card"
import { collectionDragType } from "./collection-dnd"
import { SortableCollectionItem } from "./sortable-collection-item"
import { useSortableSiblings } from "@/hooks/use-sortable-siblings"

interface SortableCollectionCardsProps {
  nodes: CollectionTreeNode[]
  /** `null` for the root group. Scopes the drag type and the reorder write. */
  parentId: string | null
  /** `false` while a sort or search is overriding the stored order. */
  isReorderable: boolean
}

export function SortableCollectionCards({
  nodes,
  parentId,
  isReorderable,
}: SortableCollectionCardsProps) {
  const { order, move, commit } = useSortableSiblings(nodes, parentId)
  const type = collectionDragType("card", parentId)

  const canDrag = isReorderable && order.length > 1

  return (
    <>
      {order.map((node, index) => (
        <SortableCollectionItem
          key={node.id}
          id={node.id}
          index={index}
          type={type}
          canDrag={canDrag}
          orientation="horizontal"
          onMove={move}
          onDrop={commit}
        >
          {({ itemRef, dragRef, isDragging }) => (
            <CollectionCard
              collection={node}
              index={index}
              siblingCount={order.length}
              cardRef={itemRef}
              dragHandleRef={canDrag ? dragRef : undefined}
              isDragging={isDragging}
            />
          )}
        </SortableCollectionItem>
      ))}
    </>
  )
}
