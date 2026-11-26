"use client"

import { SectionHeader } from "@/components/shared/section-header"
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal"
import { NoteCard } from "@/components/notes/note-card"
import { NoteList, NoteListItem } from "@/components/notes/note-list"
import { Section } from "@/components/ui/section"
import type { NoteView, PublicNote } from "@/types/note"

interface TrendingNotesProps {
  notes: PublicNote[]
  view?: NoteView
}

export function TrendingNoteContent({
  notes,
  view = "grid",
}: TrendingNotesProps) {
  return (
    <Section
      id="trending-notes"
      aria-labelledby="trending-notes-heading"
      className=""
    >
      <Reveal>
        <SectionHeader
          headingId="trending-notes-heading"
          title="Trending Notes"
          highlight="Notes"
          description="Notes students are reading and downloading right now."
          viewAllHref="/notes"
          viewAllLabel="View all notes"
        />
      </Reveal>

      {view === "list" ? (
        <NoteList className="mt-8">
          {notes?.map((note, index) => (
            <NoteListItem key={note.id} note={note} index={index} reveal />
          ))}
        </NoteList>
      ) : (
        <StaggerGroup className="mt-8 columns-1 gap-4 sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4">
          {notes?.map((note, index) => (
            <StaggerItem
              key={note.id}
              className={
                index === 3
                  ? "hidden break-inside-avoid xl:block"
                  : "break-inside-avoid"
              }
            >
              <NoteCard note={note} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </Section>
  )
}
