import { ContributorCard } from "./contributor-card"
import { ContributorListItem } from "@/lib/admin/queries"

export function ContributorsGrid({
  contributors,
}: {
  contributors: ContributorListItem[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {contributors.map((c) => (
        <ContributorCard
          key={c.id}
          id={c.id}
          displayName={c.displayName}
          username={c.username}
          avatarUrl={c.avatarUrl}
          publishedNoteCount={c.publishedNoteCount}
        />
      ))}
    </div>
  )
}
