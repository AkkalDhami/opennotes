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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminNoteListItem } from "@/types/note"
import { removeAdminNote } from "@/lib/admin/notes/admin-notes"
import { toast } from "react-hot-toast"
import { Spinner } from "@/components/ui/spinner"

interface AdminNoteRemoveDialogProps {
  note: AdminNoteListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminNoteRemoveDialog({
  note,
  open,
  onOpenChange,
}: AdminNoteRemoveDialogProps) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const result = await removeAdminNote({
        noteId: note.id,
        reason: reason || undefined,
      })
      if (result.success) {
        toast.success("Note removed successfully.")
        setReason("")
        onOpenChange(false)
      } else {
        setError(result.error ?? "Something went wrong.")
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setReason("")
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove this note?</DialogTitle>
          <DialogDescription>
            This will remove the note from the public library.
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm font-medium text-foreground">{note.title}</p>

        <div className="space-y-2">
          <Label htmlFor="remove-reason">Reason (optional)</Label>
          <Textarea
            id="remove-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Copyright complaint, duplicate upload, low quality scan…"
            rows={3}
            className="resize-none"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner />
                Removing…
              </>
            ) : (
              "Remove note"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
