"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Edit02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal-store"
import { CollectionRecord } from "@/lib/user/collection-queries"

export function EditCollectionButton({
  collection,
}: {
  collection: CollectionRecord
}) {
  const { open } = useModal()

  return (
    <Button
      variant="outline"
      onClick={() =>
        open("edit-collection", {
          editCollection: {
            description: collection.description,
            id: collection.id,
            name: collection.name,
            visibility: collection.visibility,
          },
        })
      }
    >
      <HugeiconsIcon
        icon={Edit02Icon}
        size={18}
        color="currentColor"
        strokeWidth={2}
      />
      Edit
    </Button>
  )
}
