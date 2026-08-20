import { Badge } from "@/components/ui/badge"
import {
  ContributorBlock,
  DownloadsCell,
  NoteTitleBlock,
  PublishedCell,
  StatusBadge,
} from "@/components/admin/notes/admin-note-cells"
import { AdminNoteActions } from "@/components/admin/notes/admin-note-actions"
import { AdminNoteListItem } from "@/types/note"
import { SOURCE_TYPE_DISPLAY } from "@/configs/note-display"

export function AdminNoteCard({ note }: { note: AdminNoteListItem }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <NoteTitleBlock note={note} />
        <AdminNoteActions note={note} />
      </div>

      <div className="mt-3">
        <ContributorBlock note={note} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-normal">
          {SOURCE_TYPE_DISPLAY[note.sourceType].label}
        </Badge>
        <StatusBadge note={note} />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <DownloadsCell note={note} />
        <PublishedCell note={note} />
      </div>
    </div>
  )
}
