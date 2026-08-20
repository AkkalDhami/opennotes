import Link from "next/link"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Flag02Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  File01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { getReportStats } from "@/lib/reports/get-report-stats"
import { SectionError } from "@/components/admin/section-error"

type ReportStatusFilter = "OPEN" | "RESOLVED" | "DISMISSED"

type CardDef = {
  icon: IconSvgElement
  label: string
  value: number
  status?: ReportStatusFilter
  active: boolean
}

export async function ReportsStatsSection({
  activeStatus,
}: {
  activeStatus?: ReportStatusFilter
}) {
  let stats: Awaited<ReturnType<typeof getReportStats>>

  try {
    stats = await getReportStats()
  } catch (error) {
    console.error("[admin-reports] failed to load report stats", error)
    return <SectionError title="Couldn't load report stats." />
  }

  const cards: CardDef[] = [
    {
      icon: Flag02Icon,
      label: "Open Reports",
      value: stats.open,
      status: "OPEN",
      active: activeStatus === "OPEN",
    },
    {
      icon: CheckmarkCircle02Icon,
      label: "Resolved",
      value: stats.resolved,
      status: "RESOLVED",
      active: activeStatus === "RESOLVED",
    },
    {
      icon: CancelCircleIcon,
      label: "Dismissed",
      value: stats.dismissed,
      status: "DISMISSED",
      active: activeStatus === "DISMISSED",
    },
    {
      icon: File01Icon,
      label: "Total Reports",
      value: stats.total,
      active: !activeStatus,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={
            card.status
              ? `/admin/reports?status=${card.status}`
              : "/admin/reports"
          }
          className={cn(
            "flex justify-between gap-4 rounded-lg border p-4",
            "transition-colors hover:border-primary/40",
            card.active && "border-primary/20 bg-muted"
          )}
        >
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">
              {card.label}
            </p>
            <p className="text-xl font-semibold tracking-tight text-foreground">
              {card.value}
            </p>
          </div>
          <HugeiconsIcon
            icon={card.icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="size-4.5 text-muted-foreground"
          />
        </Link>
      ))}
    </div>
  )
}
