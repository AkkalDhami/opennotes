"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download04Icon,
  EyeIcon,
  FileValidationIcon,
  RankingIcon,
} from "@hugeicons/core-free-icons"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TierChip } from "./tier-chip"
import { BadgeGrid } from "./badge-grid"
import type { ContributorSummary } from "@/lib/contributors/sync"

interface ContributorDashboardProps {
  summary: ContributorSummary
  earnedBadgeSlugs: string[]
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center justify-between py-2.5 font-mono text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <HugeiconsIcon
          icon={icon}
          size={15}
          color="currentColor"
          strokeWidth={2}
        />
        {label}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

/**
 * "Your Contribution" panel. Styled like a library due-date card / academic
 * ledger: ruled dividers, monospace figures, a stamped tier chip. Kept
 * quiet outside of that one motif per the design brief's restraint note.
 */
export function ContributorDashboard({
  summary,
  earnedBadgeSlugs,
}: ContributorDashboardProps) {
  const hasContributed = summary.publishedNotes > 0

  return (
    <Card className="overflow-hidden border-stone-200 dark:border-stone-800">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-dashed border-stone-300 pb-4 dark:border-stone-700">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Your contribution
          </p>
          <motion.p
            key={summary.score}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 font-serif text-4xl font-medium tabular-nums"
          >
            {summary.score.toLocaleString()}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">
              pts
            </span>
          </motion.p>
        </div>
        <TierChip tier={summary.tier} label={summary.tierLabel} size="lg" />
      </CardHeader>

      <CardContent className="pt-4">
        {!hasContributed ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No published contributions yet. Ranking begins once an admin
            publishes one of your notes.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2 pb-1 text-sm">
              <HugeiconsIcon
                icon={RankingIcon}
                size={16}
                color="currentColor"
                strokeWidth={2}
                className="text-amber-600"
              />
              <span className="font-medium">
                {summary.rank ? `#${summary.rank} contributor` : "Unranked"}
              </span>
            </div>

            <Separator className="my-2 border-dashed" />

            <StatRow
              icon={FileValidationIcon}
              label="Published notes"
              value={summary.publishedNotes}
            />
            <StatRow
              icon={Download04Icon}
              label="Downloads"
              value={summary.downloads.toLocaleString()}
            />
            <StatRow
              icon={EyeIcon}
              label="Views"
              value={summary.views.toLocaleString()}
            />

            <Separator className="my-3 border-dashed" />

            <p className="mb-2 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              Badges
            </p>
            <BadgeGrid earnedSlugs={earnedBadgeSlugs} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
