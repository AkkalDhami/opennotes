"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Download04Icon, FileValidationIcon } from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TierChip } from "./tier-chip"
import { BadgeGrid } from "./badge-grid"
import type { ContributorSummary } from "@/lib/contributors/sync"

interface ContributorProfileProps {
  user: { name: string; username: string; avatarUrl: string | null }
  summary: ContributorSummary
  earnedBadgeSlugs: string[]
}

export function ContributorProfile({
  user,
  summary,
  earnedBadgeSlugs,
}: ContributorProfileProps) {
  const isContributor = summary.publishedNotes > 0

  return (
    <Card className="border-stone-200 dark:border-stone-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 border">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback className="font-mono">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-xl font-medium">
              {user.name}
            </h2>
            {isContributor ? (
              <div className="mt-1 flex items-center gap-2">
                <TierChip tier={summary.tier} label={summary.tierLabel} />
                <span className="font-mono text-xs text-muted-foreground">
                  {summary.score.toLocaleString()} pts
                  {summary.rank ? ` · #${summary.rank} overall` : ""}
                </span>
              </div>
            ) : (
              <p className="mt-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Student · No published contributions yet
              </p>
            )}
          </div>
        </div>

        {isContributor && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-dashed border-stone-300 p-3 text-center dark:border-stone-700">
                <HugeiconsIcon
                  icon={FileValidationIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="mx-auto mb-1 text-muted-foreground"
                />
                <p className="font-mono text-lg font-medium tabular-nums">
                  {summary.publishedNotes}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Published notes
                </p>
              </div>
              <div className="rounded-md border border-dashed border-stone-300 p-3 text-center dark:border-stone-700">
                <HugeiconsIcon
                  icon={Download04Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                  className="mx-auto mb-1 text-muted-foreground"
                />
                <p className="font-mono text-lg font-medium tabular-nums">
                  {summary.downloads.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground">Downloads</p>
              </div>
            </div>

            <div className="mt-5">
              <BadgeGrid earnedSlugs={earnedBadgeSlugs} previewCount={4} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
