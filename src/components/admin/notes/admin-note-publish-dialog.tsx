"use client"

import { AdminNoteConfirmDialog } from "@/components/admin/notes/admin-note-confirm-dialog"
import { AdminNoteListItem } from "@/types/note"

interface AdminNotePublishDialogProps {
  note: AdminNoteListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminNotePublishDialog(props: AdminNotePublishDialogProps) {
  return <AdminNoteConfirmDialog {...props} action="publish" />
}
