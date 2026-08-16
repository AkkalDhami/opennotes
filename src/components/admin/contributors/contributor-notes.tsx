import { ContributorPagination } from "./contributor-pagination"
import { NoteCard } from "@/components/notes/note-card"
import { PublicNote } from "@/types/note"

export function ContributorNotes({
  notes,
  page,
  totalPages,
  username,
  from,
}: {
  notes: PublicNote[]
  page: number
  totalPages: number
  username: string
  from?: "contributor"
}) {
  if (notes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No published notes yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} from={from} />
        ))}
      </div>

      <ContributorPagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) =>
          p > 1
            ? `/contributors/${username}?page=${p}`
            : `/contributors/${username}`
        }
      />
    </div>
  )
}
