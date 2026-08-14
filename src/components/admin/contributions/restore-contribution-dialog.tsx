"use client"

import { useState, useTransition } from "react"
import toast from "react-hot-toast"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { NoteStatus } from "@/db/schemas/note.schema"
import { restoreContribution } from "@/lib/admin/contributions"

export function RestoreContributionDialog({
  noteId,
  noteTitle,
  fromStatus,
}: {
  noteId: string
  noteTitle: string
  fromStatus: Extract<NoteStatus, "REJECTED" | "REMOVED">
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const label = fromStatus === "REJECTED" ? "Approve" : "Restore"

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreContribution(noteId)
      if (result.success) {
        toast.success(result.message)
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="outline"
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={16}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
            {label}
          </Button>
        }
      ></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish this contribution?</DialogTitle>
          <DialogDescription>
            &ldquo;{noteTitle}&rdquo; will become publicly visible again and the
            contributor&apos;s published count will update.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleRestore} disabled={isPending}>
            {isPending ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
