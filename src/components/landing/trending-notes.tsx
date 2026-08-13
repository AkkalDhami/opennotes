import { SectionHeader } from "@/components/shared/section-header"
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal"
import { NoteCard } from "@/components/notes/note-card"
import { NoteCardSkeleton } from "@/components/notes/note-card-skeleton"
import { TrendingNotesEmpty } from "@/components/notes/trending-notes-empty"
import { trendingNotes } from "@/data/notes"
import { Section } from "@/components/ui/section"

interface TrendingNotesProps {
  isLoading?: boolean
}

export function TrendingNotes({ isLoading = false }: TrendingNotesProps) {
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

      {!isLoading && trendingNotes.length === 0 ? (
        <div className="mt-8">
          <TrendingNotesEmpty />
        </div>
      ) : (
        <StaggerGroup className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <NoteCardSkeleton key={i} />
              ))
            : trendingNotes.slice(0, 4).map((note, index) => (
                <StaggerItem
                  key={note.id}
                  // 4th card only joins the row once there's room for it (xl+)
                  className={index === 3 ? "hidden xl:block" : undefined}
                >
                  <NoteCard note={note} />
                </StaggerItem>
              ))}
        </StaggerGroup>
      )}
    </Section>
  )
}
