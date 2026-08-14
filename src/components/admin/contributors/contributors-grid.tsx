import { ContributorCard } from "./contributor-card"
import { ContributorListItem } from "./queries";

export function ContributorsGrid({
  contributors,
}: {
  contributors: ContributorListItem[]
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {contributors.map((c) => (
        <ContributorCard
          key={c.id}
          id={c.id}
          displayName={c.displayName}
          username={c.username}
          avatarUrl={c.avatarUrl}
          publishedNoteCount={c.publishedNoteCount}
          topSubject={c.topSubject}
        />
      ))}
    </div>
  )
}
