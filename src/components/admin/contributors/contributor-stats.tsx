import {
  Album02Icon,
  BookOpen01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import { ContributorStats } from "@/lib/admin/queries"
import { HugeiconsIcon } from "@hugeicons/react"

const STAT_ICONS = [UserGroupIcon, BookOpen01Icon, Album02Icon]

export function ContributorStatsSection({
  stats,
}: {
  stats: ContributorStats
}) {
  const items = [
    { label: "Contributors", value: stats.totalContributors },
    { label: "Published Notes", value: stats.totalNotesShared },
    { label: "Subjects Covered", value: stats.totalSubjects },
  ]

  return (
    <section
      aria-label="Contributor statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      {items.map((item, i) => {
        const Icon = STAT_ICONS[i]
        return (
          <div
            key={item.label}
            className="flex items-center border gap-2 rounded-[16px] bg-card p-2"
          >
            {Icon && (
              <HugeiconsIcon
                icon={Icon}
                size={21}
                strokeWidth={2}
                className="size-16 rounded-[10px] border bg-muted p-4 text-brand"
                aria-hidden="true"
              />
            )}
            <div className="flex-col flex gap-2">
              <span className="text-2xl font-medium text-foreground">
                {item.value.toLocaleString()}
              </span>
              <span className="text-muted-foreground">
                {item.label}
              </span>
            </div>
          </div>
        )
      })}
    </section>
  )
}
