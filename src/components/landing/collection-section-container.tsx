import { getPublicCollections } from "@/lib/collections/collections-queries"
import type { CollectionView } from "@/components/collections/collection-card"
import { CollectionSection } from "./collection-section"

interface CollectionsSectionContainerProps {
  view?: CollectionView
}

export async function CollectionsSectionContainer({
  view = "grid",
}: CollectionsSectionContainerProps = {}) {
  const { items } = await getPublicCollections({
    page: 1,
    sort: "recent",
  })

  return <CollectionSection collections={items.slice(0, 6)} view={view} />
}
