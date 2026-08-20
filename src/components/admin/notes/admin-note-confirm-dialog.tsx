"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  publishAdminNote,
  restoreAdminNote,
  unpublishAdminNote,
} from "@/lib/admin/notes/admin-notes"
import { AdminNoteListItem } from "@/types/note"
import { toast } from "react-hot-toast"

type ConfirmAction = "publish" | "unpublish" | "restore"

const COPY: Record<
  ConfirmAction,
  {
    title: string
    description: string
    confirmLabel: string
    successMessage: string
  }
> = {
  publish: {
    title: "Publish this note?",
    description: "This note will become publicly visible and downloadable.",
    confirmLabel: "Publish note",
    successMessage: "Note published.",
  },
  unpublish: {
    title: "Unpublish this note?",
    description:
      "The note will be pulled from the public library and sent back to pending review.",
    confirmLabel: "Unpublish note",
    successMessage: "Note unpublished.",
  },
  restore: {
    title: "Restore this note?",
    description:
      "The note will go back to pending review, not straight to published.",
    confirmLabel: "Restore note",
    successMessage: "Note restored to pending review.",
  },
}

const ACTION_FN: Record<
  ConfirmAction,
  (input: { noteId: string }) => Promise<{ success: boolean; error?: string }>
> = {
  publish: publishAdminNote,
  unpublish: unpublishAdminNote,
  restore: restoreAdminNote,
}

interface AdminNoteConfirmDialogProps {
  note: AdminNoteListItem
  action: ConfirmAction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminNoteConfirmDialog({
  note,
  action,
  open,
  onOpenChange,
}: AdminNoteConfirmDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const copy = COPY[action]

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await ACTION_FN[action]({ noteId: note.id })
      if (result.success) {
        toast.success(copy.successMessage)
        onOpenChange(false)
      } else {
        setError(result.error ?? "Something went wrong.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <p className="text-sm font-medium text-foreground">{note.title}</p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Working…" : copy.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
