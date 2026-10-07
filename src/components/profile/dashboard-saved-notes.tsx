import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { NoteCard } from "@/components/notes/note-card"
import { PublicNote } from "@/types/note"
import { Route } from "next"

interface DashboardSavedNotesProps {
  notes: PublicNote[]
  total: number
}

export function DashboardSavedNotes({
  notes,
  total,
}: DashboardSavedNotesProps) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium tracking-tight text-foreground">
            Saved notes
          </h2>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "bookmark" : "bookmarks"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          nativeButton={false}
          render={
            <Link href={"/profile/saved-notes" as Route}>
              View all
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={14}
                color="currentColor"
                strokeWidth={2}
                className="size-3.5"
              />
            </Link>
          }
        />
      </div>

      {notes.length === 0 ? (
        <div className="space-y-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t saved any notes yet.
          </p>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/notes">Browse notes</Link>}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </section>
  )
}
