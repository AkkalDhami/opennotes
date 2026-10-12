import { getPublicCollections } from "@/lib/collections/collections-queries"
import { CollectionSection } from "./collection-section"

export async function CollectionsSectionContainer() {
  const { items } = await getPublicCollections({
    page: 1,
    sort: "recent",
  })

  return <CollectionSection collections={items.slice(0, 6)} />
}
