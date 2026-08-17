import {
  File01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  UserGroupIcon,
  Download04Icon,
  Flag02Icon,
  CalendarAdd01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"

import { StatCard } from "./stat-card"
import { DashboardSectionError } from "./dashboard-section-error"
import {
  AdminStats,
  getAdminStats,
} from "@/lib/admin/dashboard/get-admin-stats"

function buildCards(stats: AdminStats) {
  return [
    {
      icon: File01Icon,
      label: "Total Notes",
      value: stats.totalNotes,
      description: "All notes on the platform",
    },
    {
      icon: CheckmarkCircle02Icon,
      label: "Published Notes",
      value: stats.publishedNotes,
      description: "Currently visible to students",
    },
    {
      icon: Clock01Icon,
      label: "Pending Review",
      value: stats.pendingReview,
      description: "Notes waiting for moderation",
    },
    {
      icon: UserGroupIcon,
      label: "Total Contributors",
      value: stats.totalContributors,
      description: "Users who have shared notes",
    },
    {
      icon: Download04Icon,
      label: "Total Downloads",
      value: stats.totalDownloads.toLocaleString(),
      description: "Downloads across published notes",
    },
    {
      icon: Flag02Icon,
      label: "Open Reports",
      value: stats.openReports,
      description: "Content reports requiring attention",
      tone: stats.openReports > 0 ? "warning" : "default",
    },
    {
      icon: CalendarAdd01Icon,
      label: "Added Recently",
      value: stats.notesAddedLast30Days,
      description: "New notes in the last 30 days",
    },
    {
      icon: AlertCircleIcon,
      label: "Processing Errors",
      value: stats.processingErrors,
      description: "Uploads that failed to process",
      tone: stats.processingErrors > 0 ? "warning" : "default",
    },
  ]
}

export async function StatsSection() {
  let stats: AdminStats

  try {
    stats = await getAdminStats()
  } catch (error) {
    console.error("[admin-dashboard] failed to load platform stats", error)
    return <DashboardSectionError title="Couldn't load platform stats." />
  }

  const cards = buildCards(stats)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          description={card.description}
          icon={card.icon}
          label={card.label}
          value={card.value}
          tone={card.tone as "default" | "warning"}
        />
      ))}
    </div>
  )
}
