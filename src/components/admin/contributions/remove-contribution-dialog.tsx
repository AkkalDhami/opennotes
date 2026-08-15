"use client"

import { useState, useTransition } from "react"
import toast from "react-hot-toast"
import { Delete02Icon } from "@hugeicons/core-free-icons"
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
import { removeContribution } from "@/lib/admin/contributions"

export function RemoveContributionDialog({
  noteId,
  noteTitle,
}: {
  noteId: string
  noteTitle: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      const result = await removeContribution(noteId)
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
        nativeButton={false}
        render={
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              size={16}
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
            Remove
          </Button>
        }
      ></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove this contribution?</DialogTitle>
          <DialogDescription>
            &ldquo;{noteTitle}&rdquo; will be unpublished and disappear from
            public listings immediately. The record and file are kept, and it
            can be republished later.
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
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isPending}
          >
            {isPending ? "Removing..." : "Remove contribution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
