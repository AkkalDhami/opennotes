"use client"

import { SectionHeader } from "@/components/shared/section-header"
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal"
import { NoteCard } from "@/components/notes/note-card"
import { Section } from "@/components/ui/section"
import { PublicNote } from "@/types/note"

interface TrendingNotesProps {
  notes: PublicNote[]
}

export function TrendingNoteContent({
  notes,
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
          title="Trending notes"
          description="Notes students are reading and downloading right now."
          viewAllHref="/notes"
          viewAllLabel="View all notes"
        />
      </Reveal>

      <StaggerGroup className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note, index) => (
          <StaggerItem
            key={note.id}
            className={index === 3 ? "hidden xl:block" : undefined}
          >
            <NoteCard note={note} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  )
}
