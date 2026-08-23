"use client"

import { NoteCard } from "@/components/notes/note-card"
import type { PublicNote } from "@/types/note"

interface SavedNotesGridProps {
  initialNotes: PublicNote[]
}

export function SavedNotesGrid({ initialNotes }: SavedNotesGridProps) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      role="list"
      aria-label="Saved notes"
    >
      {initialNotes.map((note) => (
        <div key={note.id} role="listitem">
          <NoteCard note={note} />
        </div>
      ))}
    </div>
  )
}
