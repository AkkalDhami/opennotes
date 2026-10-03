"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  File01Icon,
  Download01Icon,
  ViewIcon,
  Bookmark01Icon,
  Analytics01Icon,
  ArrowUpRight01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CONTRIBUTOR_SCORE } from "@/constants/badge.constants"

type Tone = "green" | "blue" | "purple" | "orange"
type MetricKey = "publishedNotes" | "downloads" | "views" | "bookmarks"

/** Only the values are passed in. Labels, icons, hints and weights are fixed below. */
export interface ContributionStatsData {
  publishedNotes: number
  downloads: number
  views: number
  bookmarks: number
  trend?: Partial<Record<MetricKey, number>>
  totalScore?: number
}

const TONES: Record<Tone, { bg: string; fg: string }> = {
  green: { bg: "bg-emerald-500/10", fg: "text-emerald-600" },
  blue: { bg: "bg-blue-500/10", fg: "text-blue-600" },
  purple: { bg: "bg-violet-500/10", fg: "text-violet-600" },
  orange: { bg: "bg-orange-500/10", fg: "text-orange-500" },
}

// Static config: label, hint, icon, colors, weight
const METRICS: {
  key: MetricKey
  label: string
  hint: string
  weight: number
  icon: IconSvgElement
  tone: Tone
  breakdownTone: Tone
}[] = [
  {
    key: "publishedNotes",
    label: "Published Notes",
    hint: "Total notes you've shared",
    weight: CONTRIBUTOR_SCORE.PUBLISHED_NOTE,
    icon: File01Icon,
    tone: "green",
    breakdownTone: "green",
  },
  {
    key: "downloads",
    label: "Downloads",
    hint: "Total downloads on your notes",
    weight: CONTRIBUTOR_SCORE.DOWNLOAD,
    icon: Download01Icon,
    tone: "green",
    breakdownTone: "blue",
  },
  {
    key: "views",
    label: "Views",
    hint: "Total views on your notes",
    weight: CONTRIBUTOR_SCORE.VIEW,
    icon: ViewIcon,
    tone: "blue",
    breakdownTone: "purple",
  },
  {
    key: "bookmarks",
    label: "Bookmarks",
    hint: "Total bookmarks on your notes",
    weight: CONTRIBUTOR_SCORE.BOOKMARK,
    icon: Bookmark01Icon,
    tone: "orange",
    breakdownTone: "orange",
  },
]

function IconBadge({
  icon,
  tone,
  size = "md",
}: {
  icon: IconSvgElement
  tone: Tone
  size?: "sm" | "md"
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        TONES[tone].bg,
        TONES[tone].fg,
        size === "md" ? "size-10" : "size-7"
      )}
    >
      <HugeiconsIcon
        icon={icon}
        size={size === "md" ? 22 : 18}
        strokeWidth={1.8}
      />
    </span>
  )
}

function Trend({ value }: { value?: number }) {
  if (!value) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <span className="inline-flex items-center gap-0.5 text-sm font-medium text-emerald-600">
      <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={2} />
      {value}
    </span>
  )
}

function StatCard({
  metric,
  value,
  trend,
}: {
  metric: (typeof METRICS)[number]
  value: number
  trend?: number
}) {
  return (
    <Card className="gap-4 rounded-2xl py-5 shadow-none">
      <CardHeader className="flex flex-row items-center gap-3 px-5">
        <IconBadge icon={metric.icon} tone={metric.tone} />
        <CardTitle className="text-base font-medium">{metric.label}</CardTitle>
      </CardHeader>
      <CardContent className="px-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold tracking-tight">
            {value.toLocaleString()}
          </span>
          <Trend value={trend} />
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{metric.hint}</p>
      </CardContent>
    </Card>
  )
}

export function ContributionStats({ data }: { data: ContributionStatsData }) {
  const total =
    data.totalScore ??
    Math.round(METRICS.reduce((sum, m) => sum + data[m.key] * m.weight, 0))

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {METRICS.map((m) => (
          <StatCard
            key={m.key}
            metric={m}
            value={data[m.key]}
            trend={data.trend?.[m.key]}
          />
        ))}
      </div>

      {/* Contribution score breakdown */}
      <Card className="gap-5 rounded-lg py-5 shadow-none">
        <CardHeader className="flex flex-row items-center gap-3 px-5">
          <span className="flex size-8 items-center justify-center text-emerald-600">
            <HugeiconsIcon icon={Analytics01Icon} size={24} strokeWidth={1.8} />
          </span>
          <CardTitle className="text-base font-medium">
            Contribution Score Breakdown
          </CardTitle>
        </CardHeader>

        <CardContent className="px-5">
          <ul className="divide-y">
            {METRICS.map((m) => (
              <li
                key={m.key}
                className="flex items-center gap-3 py-3 first:pt-0"
              >
                <IconBadge icon={m.icon} tone={m.breakdownTone} size="sm" />
                <span className="flex-1 text-sm">{m.label}</span>
                <span className="w-16 text-center text-sm text-muted-foreground tabular-nums">
                  {data[m.key]} × {m.weight}
                </span>
                <span className="w-10 text-right text-sm font-semibold tabular-nums">
                  {(data[m.key] * m.weight).toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm font-semibold">Total Score</span>
            <span className="flex items-center gap-1.5 text-xl font-bold tabular-nums">
              {total.toLocaleString()}
              <HugeiconsIcon
                icon={StarIcon}
                size={20}
                className="fill-amber-400 text-amber-400"
              />
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
