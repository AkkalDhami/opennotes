"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Share08Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal-store"
import { CollectionRecord } from "@/lib/user/collection-queries"

export function ShareCollectionButton({
  collection,
}: {
  collection: CollectionRecord
}) {
  const { open } = useModal()

  return (
    <Button
      variant="outline"
      onClick={() =>
        open("share-collection", {
          shareCollection: {
            id: collection.id,
            slug: collection.slug,
            name: collection.name,
            description: collection.description,
            visibility: collection.visibility,
          },
        })
      }
    >
      <HugeiconsIcon
        icon={Share08Icon}
        size={18}
        color="currentColor"
        strokeWidth={2}
      />
      Share
    </Button>
  )
}
