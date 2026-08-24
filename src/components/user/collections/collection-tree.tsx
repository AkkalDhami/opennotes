import { CollectionTreeNode } from "@/lib/user/collection-queries"
import { CollectionRow } from "./collection-row"

export function CollectionTree({ nodes }: { nodes: CollectionTreeNode[] }) {
  return (
    <div
      role="tree"
      aria-label="Collections"
      className="divide-y divide-border rounded-lg border border-border bg-card"
    >
      {nodes.map((node, index) => (
        <CollectionRow
          key={node.id}
          node={node}
          depth={0}
          siblingCount={nodes.length}
          siblingIndex={index}
        />
      ))}
    </div>
  )
}
