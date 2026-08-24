import { Route } from "next"

import { CollectionTreeNode } from "@/lib/user/collection-queries"
import { CollectionCard } from "./collection-card"

interface CollectionGridProps {
  nodes: CollectionTreeNode[]
}

export function CollectionGrid({ nodes }: CollectionGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {nodes.map((node, i) => (
        <CollectionCard
          key={node.id}
          collection={node}
          index={i}
          href={`/profile/collections/${node.slug}` as Route}
        />
      ))}
    </div>
  )
}
