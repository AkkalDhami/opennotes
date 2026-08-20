import { TableCell, TableRow } from "@/components/ui/table"
import {
  ContributorBlock,
  DownloadsCell,
  NoteTitleBlock,
  PublishedCell,
  SourceCell,
  StatusBadge,
} from "@/components/admin/notes/admin-note-cells"
import { AdminNoteActions } from "@/components/admin/notes/admin-note-actions"
import { AdminNoteListItem } from "@/types/note"
import { slugToTitle } from "@/utils/slug"

export function AdminNoteRow({ note }: { note: AdminNoteListItem }) {
  return (
    <TableRow>
      <TableCell>
        <NoteTitleBlock note={note} />
      </TableCell>
      <TableCell>
        <ContributorBlock note={note} />
      </TableCell>
      <TableCell className="text-sm text-foreground">
        {slugToTitle(note.subject)}
      </TableCell>
      <TableCell>
        <SourceCell note={note} />
      </TableCell>
      <TableCell>
        <StatusBadge note={note} />
      </TableCell>
      <TableCell>
        <DownloadsCell note={note} />
      </TableCell>
      <TableCell>
        <PublishedCell note={note} />
      </TableCell>
      <TableCell>
        <AdminNoteActions note={note} />
      </TableCell>
    </TableRow>
  )
}
