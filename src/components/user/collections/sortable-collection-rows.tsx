"use client"

import type { CollectionTreeNode } from "@/lib/user/collection-queries"

import { CollectionRow } from "./collection-row"
import { collectionDragType } from "./collection-dnd"
import { SortableCollectionItem } from "./sortable-collection-item"
import { useSortableSiblings } from "@/hooks/use-sortable-siblings"

interface SortableCollectionRowsProps {
  nodes: CollectionTreeNode[]
  /** `null` for the root group. Scopes the drag type and the reorder write. */
  parentId: string | null
  depth: number
  /** `false` while a sort or search is overriding the stored order. */
  isReorderable: boolean
}

/**
 * One reorderable sibling group in the tree view, recursing through
 * `CollectionRow`'s children slot so each nested group gets its own hook
 * instance and its own drag type. That scoping is what makes a row droppable
 * only among its actual siblings.
 */
export function SortableCollectionRows({
  nodes,
  parentId,
  depth,
  isReorderable,
}: SortableCollectionRowsProps) {
  const { order, move, commit } = useSortableSiblings(nodes, parentId)
  const type = collectionDragType("row", parentId)

  // A single item has nothing to swap with, so the handle would be noise.
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
          orientation="vertical"
          onMove={move}
          onDrop={commit}
        >
          {({ itemRef, dragRef, isDragging }) => (
            <CollectionRow
              node={node}
              depth={depth}
              siblingCount={order.length}
              siblingIndex={index}
              rowRef={itemRef}
              dragHandleRef={canDrag ? dragRef : undefined}
              isDragging={isDragging}
              childrenSlot={
                node.children.length > 0 ? (
                  <SortableCollectionRows
                    nodes={node.children}
                    parentId={node.id}
                    depth={depth + 1}
                    isReorderable={isReorderable}
                  />
                ) : null
              }
            />
          )}
        </SortableCollectionItem>
      ))}
    </>
  )
}
