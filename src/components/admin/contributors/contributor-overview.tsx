"use client"

import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Download01Icon,
  File01Icon,
  FireIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContributionActivity } from "@/lib/contributions/get-contribution-activity"
import {
  ContributorRecentActivity,
  ContributorStats,
} from "@/lib/admin/contributors"
import { NoteContributionGraph } from "@/components/contributions/contribution-graph-content"

interface ContributorOverviewProps {
  stats: ContributorStats
  contributionActivity: ContributionActivity
  recentActivity: ContributorRecentActivity[]
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value)
}

function getStatusVariant(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "default"

    case "PENDING_REVIEW":
      return "secondary"

    case "REJECTED":
    case "REMOVED":
      return "destructive"

    default:
      return "outline"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "Published"

    case "PENDING_REVIEW":
      return "Pending review"

    case "REJECTED":
      return "Rejected"

    case "REMOVED":
      return "Removed"

    case "DRAFT":
      return "Draft"

    default:
      return status
  }
}

function getActivityText(activity: ContributorRecentActivity) {
  switch (activity.status) {
    case "PUBLISHED":
      return "Published a note"

    case "PENDING_REVIEW":
      return "Submitted a note for review"

    case "REJECTED":
      return "Note was rejected"

    case "REMOVED":
      return "Note was removed"

    case "DRAFT":
      return "Created a draft"

    default:
      return "Updated a note"
  }
}

export function ContributorOverview({
  stats,
  contributionActivity,
  recentActivity,
}: ContributorOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Contributions"
          value={stats.totalContributions}
          icon={File01Icon}
          description={`${stats.publishedNotes} published`}
        />

        <StatCard
          title="Published"
          value={stats.publishedNotes}
          icon={CheckmarkCircle02Icon}
          description={`${stats.pendingNotes} awaiting review`}
        />

        <StatCard
          title="Downloads"
          value={stats.totalDownloads ?? 0}
          icon={Download01Icon}
          description="Across published notes"
        />
      </div>

      {/* Moderation summary */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <MiniStat
          icon={FireIcon}
          label="Longest Streak"
          value={`${contributionActivity.longestStreak} days`}
        />
        <MiniStat
          icon={Clock01Icon}
          label="Pending Review"
          value={stats.pendingNotes}
        />

        <MiniStat
          icon={UserIcon}
          label="Rejected"
          value={stats.rejectedNotes}
        />
        <MiniStat icon={UserIcon} label="Rejected" value={stats.removedNotes} />
      </div>

      {/* Activity + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <NoteContributionGraph initialData={contributionActivity.days} />

        {/* Recent activity */}
        <Card className="p-0">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>

          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                No recent activity.
              </div>
            ) : (
              <div className="space-y-5">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="relative flex gap-3">
                    {index !== recentActivity.length - 1 && (
                      <div className="absolute top-5 left-1.75 h-full w-px bg-border" />
                    )}

                    <div className="relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2 border-primary bg-background" />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {getActivityText(activity)}
                        </p>

                        <Badge
                          variant={getStatusVariant(activity.status)}
                          className="text-[10px]"
                        >
                          {getStatusLabel(activity.status)}
                        </Badge>
                      </div>

                      <p className="truncate text-sm text-muted-foreground">
                        {activity.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: number
  description: string
  icon: IconSvgElement
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{title}</p>

        <p className="text-2xl font-semibold tracking-tight">
          {formatNumber(value)}
        </p>

        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <HugeiconsIcon icon={icon} size={18} strokeWidth={2} />
      </div>
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement
  label: string
  value: number | string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <HugeiconsIcon icon={icon} size={18} strokeWidth={2} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="font-semibold">{value}</p>
      </div>
    </div>
  )
}
