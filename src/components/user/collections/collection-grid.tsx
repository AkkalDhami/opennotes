import { CollectionTreeNode } from "@/lib/user/collection-queries"

import { CollectionDndProvider } from "./collection-dnd-provider"
import { ReorderHint } from "./reorder-hint"
import { SortableCollectionCards } from "./sortable-collection-cards"

interface CollectionGridProps {
  nodes: CollectionTreeNode[]
  /** See {@link CollectionTree} — only the stored order can be dragged. */
  isReorderable?: boolean
}

export function CollectionGrid({
  nodes,
  isReorderable = false,
}: CollectionGridProps) {
  return (
    <CollectionDndProvider>
      <ReorderHint isReorderable={isReorderable} itemCount={nodes.length} />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <SortableCollectionCards
          nodes={nodes}
          parentId={null}
          isReorderable={isReorderable}
        />
      </div>
    </CollectionDndProvider>
  )
}
