import { HugeiconsIcon } from "@hugeicons/react"
import {
  File01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Alert02Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import { IconSvgElement } from "@hugeicons/react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ContributionStats } from "@/types/contribution"

interface ProfileStatsProps {
  stats: ContributionStats
}

interface StatCardConfig {
  label: string
  value: number
  icon: IconSvgElement
  accentClassName?: string
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const cards: StatCardConfig[] = [
    { label: "Total Contributions", value: stats.total, icon: File01Icon },
    {
      label: "Published",
      value: stats.published,
      icon: CheckmarkCircle02Icon,
      accentClassName: "text-success",
    },
    {
      label: "Pending Review",
      value: stats.pendingReview,
      icon: Clock01Icon,
      accentClassName: "text-warning",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: Alert02Icon,
      accentClassName: "text-destructive",
    },
    {
      label: "Total Downloads",
      value: stats.totalDownloads,
      icon: Download01Icon,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} className="border-0 p-4">
          <CardContent className="flex flex-col gap-2 p-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {card.label}
              </span>
              <HugeiconsIcon
                icon={card.icon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className={cn(
                  "size-4 text-muted-foreground",
                  card.accentClassName
                )}
              />
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {card.value.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
