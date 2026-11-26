import { SectionHeader } from "@/components/shared/section-header"
import { Reveal } from "@/components/shared/reveal"
import {
  NoteCardSkeleton,
  NoteListSkeleton,
} from "@/components/notes/note-card-skeleton"
import { Section } from "@/components/ui/section"
import { getTrendingNotes } from "@/lib/notes/get-trending-notes"
import { Suspense } from "react"
import { TrendingNoteContent } from "./trending-note-content"
import type { NoteView } from "@/types/note"

interface TrendingNotesSectionProps {
  view?: NoteView
}

export function TrendingNotesSkeleton({
  view = "grid",
}: TrendingNotesSectionProps) {
  if (view === "list") {
    return (
      <div className="mt-8 px-4">
        <NoteListSkeleton count={4} />
      </div>
    )
  }

  return (
    <div className="mt-8 columns-1 gap-4 px-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  )
}

export async function TrendingNotesData({
  view = "grid",
}: TrendingNotesSectionProps) {
  const notes = await getTrendingNotes()

  return <TrendingNoteContent notes={notes} view={view} />
}

export function TrendingNotesSection({
  view = "grid",
}: TrendingNotesSectionProps) {
  return (
    <Suspense fallback={<TrendingNotesSkeleton view={view} />}>
      <TrendingNotesData view={view} />
    </Suspense>
  )
}

export function TrendingNotes({ view = "grid" }: TrendingNotesSectionProps) {
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
          highlight="notes"
        />
      </Reveal>
      <TrendingNotesSection view={view} />
    </Section>
  )
}
