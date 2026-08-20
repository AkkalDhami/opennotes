import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminNoteRow } from "@/components/admin/notes/admin-note-row"
import { AdminNoteCard } from "@/components/admin/notes/admin-note-card"
import { AdminNotesEmptyState } from "@/components/admin/notes/admin-notes-empty-state"
import { AdminNoteListItem } from "@/types/note"

interface AdminNotesTableProps {
  notes: AdminNoteListItem[]
  hasActiveFilters: boolean
}

export function AdminNotesTable({
  notes,
  hasActiveFilters,
}: AdminNotesTableProps) {
  if (notes.length === 0) {
    return <AdminNotesEmptyState hasActiveFilters={hasActiveFilters} />
  }

  return (
    <>
      {/* Desktop / tablet: full data table, scrolls horizontally if needed. */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-60">Note</TableHead>
              <TableHead className="min-w-45">Contributor</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note) => (
              <AdminNoteRow key={note.id} note={note} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {notes.map((note) => (
          <AdminNoteCard key={note.id} note={note} />
        ))}
      </div>
    </>
  )
}
