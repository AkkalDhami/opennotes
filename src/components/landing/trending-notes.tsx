import { SectionHeader } from "@/components/shared/section-header"
import { Reveal } from "@/components/shared/reveal"
import { NoteCardSkeleton } from "@/components/notes/note-card-skeleton"
import { Section } from "@/components/ui/section"
import { getTrendingNotes } from "@/lib/notes/get-trending-notes"
import { Suspense } from "react"
import { TrendingNoteContent } from "./trending-note-content"

export function TrendingNotesSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  )
}

export async function TrendingNotesData() {
  const notes = await getTrendingNotes()

  return <TrendingNoteContent notes={notes} />
}

export function TrendingNotesSection() {
  return (
    <Suspense fallback={<TrendingNotesSkeleton />}>
      <TrendingNotesData />
    </Suspense>
  )
}

export function TrendingNotes() {
  return (
    <Section
      id="trending-notes"
      aria-labelledby="trending-notes-heading"
      className="px-0"
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
      <TrendingNotesSection />
    </Section>
  )
}
