"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { AddNotesDialog } from "./add-notes-dialog"

/**
 * Opens the note picker for one collection.
 *
 * The dialog keeps its own local open state rather than joining the modal store:
 * it's mounted next to the button that needs it, and it already takes
 * `open`/`onOpenChange`.
 */
export function AddNotesButton({
  collectionId,
  collectionName,
  variant = "outline",
  label = "Add notes",
}: {
  collectionId: string
  collectionName: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  label?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant={variant} size="sm" onClick={() => setOpen(true)}>
        <HugeiconsIcon
          icon={PlusSignIcon}
          size={16}
          color="currentColor"
          strokeWidth={2}
        />
        {label}
      </Button>

      <AddNotesDialog
        open={open}
        onOpenChange={setOpen}
        collectionId={collectionId}
        collectionName={collectionName}
      />
    </>
  )
}
