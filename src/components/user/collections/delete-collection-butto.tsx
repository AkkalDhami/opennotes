"use client"

import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal-store"
import { CollectionRecord } from "@/lib/user/collection-queries"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function DeleteCollectionButton({
  data,
  label = "Delete Collection",
}: {
  data: Pick<CollectionRecord, "id" | "name">
  label?: string
}) {
  const { open } = useModal()
  return (
    <Button
      variant="destructive"
      onClick={() =>
        open("delete-collection", {
          deleteCollection: data,
        })
      }
    >
      <HugeiconsIcon
        icon={Delete02Icon}
        size={18}
        color="currentColor"
        strokeWidth={2}
      />
      {label}
    </Button>
  )
}
