import { AdminContributionStats } from "@/lib/notes/queries"

export function ContributionStats({
  stats,
}: {
  stats: AdminContributionStats
}) {
  const cards = [
    {
      label: "Pending Review",
      value: stats.pendingReview,
      hint: "Awaiting moderation",
    },
    {
      label: "Published",
      value: stats.published,
      hint: "Published notes",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      hint: "Rejected submissions",
    },
    {
      label: "Contributors",
      value: stats.contributors,
      hint: "Users with published notes",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="space-y-2 rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {card.label}
          </h3>
          <div className="text-3xl font-semibold text-foreground tabular-nums">
            {card.value.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
        </div>
      ))}
    </div>
  )
}
