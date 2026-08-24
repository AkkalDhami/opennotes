"use client"

import { Button } from "@/components/ui/button"
import { CollectionFormDialogType, useModal } from "@/hooks/use-modal-store"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function CreateCollectionButton({
  data,
  label = "Create Collection",
}: {
  data: CollectionFormDialogType
  label?: string
}) {
  const { open } = useModal()
  return (
    <Button
      onClick={() =>
        open("create-collection", {
          collectionFormDialog: {
            ...data,
          },
        })
      }
    >
      <HugeiconsIcon
        icon={PlusSignIcon}
        size={18}
        color="currentColor"
        strokeWidth={2}
      />
      {label}
    </Button>
  )
}
