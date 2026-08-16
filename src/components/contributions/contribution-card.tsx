"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Download04Icon, Calendar04Icon } from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/profile/status-badge"
import { ContributionActionsMenu } from "@/components/contributions/contribution-actions-menu"
import {
  ContributionDetailsSheet,
  useContributionDetailsSheet,
} from "@/components/contributions/contribution-details-sheet"
import { ContributionListItem } from "@/types/contribution"
import { formatDate } from "@/utils/format-date"

interface ContributionCardListProps {
  contributions: ContributionListItem[]
}

export function ContributionCardList({
  contributions,
}: ContributionCardListProps) {
  const details = useContributionDetailsSheet()

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {contributions.map((contribution) => (
        <Card key={contribution.id} className="shadow-none">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {contribution.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {contribution.subject} · {contribution.category}
                </p>
              </div>
              <ContributionActionsMenu
                contribution={contribution}
                onViewDetails={details.view}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {contribution.educationLevel}
              {contribution.course ? ` · ${contribution.course}` : ""}
              {contribution.grade ? ` · ${contribution.grade}` : ""}
            </p>

            <div className="flex items-center justify-between">
              <StatusBadge status={contribution.status} />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon
                    icon={Download04Icon}
                    size={14}
                    color="currentColor"
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  {contribution.downloadCount.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <HugeiconsIcon
                icon={Calendar04Icon}
                size={14}
                color="currentColor"
                strokeWidth={2}
                className="size-3.5"
              />
              Submitted{" "}
              {formatDate(contribution.createdAt, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>

            {contribution.status === "REJECTED" &&
            contribution.rejectionReason ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
                <p className="text-[11px] font-medium text-destructive">
                  Rejection reason
                </p>
                <p className="mt-0.5 text-xs text-foreground/80">
                  {contribution.rejectionReason}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}

      {details.activeContribution ? (
        <ContributionDetailsSheet
          contribution={details.activeContribution}
          open={details.open}
          onOpenChange={(open) => !open && details.close()}
        />
      ) : null}
    </div>
  )
}
