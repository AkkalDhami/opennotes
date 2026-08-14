import {
  Album02Icon,
  BookOpen01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import type { ContributorStats } from "./queries"
import { HugeiconsIcon } from "@hugeicons/react"

// NOTE: verify these hugeicons-react export names against your installed
// version — icon names occasionally change between package versions.
const STAT_ICONS = [UserGroupIcon, BookOpen01Icon, Album02Icon]

export function ContributorStatsSection({
  stats,
}: {
  stats: ContributorStats
}) {
  const items = [
    { label: "Contributors", value: stats.totalContributors },
    { label: "Notes Shared", value: stats.totalNotesShared },
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
          <Card key={item.label} className="border-border p-3 bg-card">
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              {Icon && (
                <HugeiconsIcon
                  icon={Icon}
                  size={21}
                  strokeWidth={2}
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span className="text-2xl font-semibold text-foreground">
                {item.value.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
