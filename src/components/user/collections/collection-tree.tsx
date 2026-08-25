import { CollectionTreeNode } from "@/lib/user/collection-queries"

import { CollectionDndProvider } from "./collection-dnd-provider"
import { ReorderHint } from "./reorder-hint"
import { SortableCollectionRows } from "./sortable-collection-rows"

export function CollectionTree({
  nodes,
  isReorderable = false,
}: {
  nodes: CollectionTreeNode[]
  /**
   * Dragging is only offered while the list is showing its stored order —
   * dropping into a name-sorted or filtered list would write positions the user
   * can't see, so the toolbar's "Custom order" is a precondition.
   */
  isReorderable?: boolean
}) {
  return (
    <CollectionDndProvider>
      <ReorderHint isReorderable={isReorderable} itemCount={nodes.length} />

      <div
        role="tree"
        aria-label="Collections"
        className="divide-y divide-border rounded-lg border border-border bg-card"
      >
        <SortableCollectionRows
          nodes={nodes}
          parentId={null}
          depth={0}
          isReorderable={isReorderable}
        />
      </div>
    </CollectionDndProvider>
  )
}
