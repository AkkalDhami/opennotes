import type { ContributorListItem } from "./queries"
import { ContributorCard } from "./contributor-card"
import { Heading } from "@/components/ui/heading"

export function TopContributors({
  contributors,
}: {
  contributors: ContributorListItem[]
}) {
  if (contributors.length === 0) return null

  return (
    <section aria-labelledby="top-contributors-heading" className="px-4">
      <Heading id="top-contributors-heading">Top Contributors</Heading>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {contributors.map((c, i) => (
          <ContributorCard
            key={c.id}
            id={c.id}
            displayName={c.displayName}
            username={c.username}
            avatarUrl={c.avatarUrl}
            publishedNoteCount={c.publishedNoteCount}
            topSubject={c.topSubject}
            rank={(i + 1) as 1 | 2 | 3}
          />
        ))}
      </div>
    </section>
  )
}
