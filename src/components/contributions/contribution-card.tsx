"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download01Icon,
  Calendar04Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/profile/status-badge"
import { ContributionActionsMenu } from "@/components/contributions/contribution-actions-menu"
import {
  ContributionDetailsSheet,
  useContributionDetailsSheet,
} from "@/components/contributions/contribution-details-sheet"
import { ContributionListItem } from "@/types/contribution"
import { formatDate } from "@/utils/format-date"
import { slugToTitle } from "@/utils/slug"
import { submitDraftContribution } from "@/lib/user/submit-contribution"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface ContributionCardListProps {
  contributions: ContributionListItem[]
  layout?: "stack" | "grid"
}

export function ContributionCardList({
  contributions,
  layout = "stack",
}: ContributionCardListProps) {
  const details = useContributionDetailsSheet()
  const router = useRouter()
  const submitDraft = async (contribution: ContributionListItem) => {
    const result = await submitDraftContribution(contribution.id)
    if (!result.success) return toast.error(result.error)
    toast.success(result.message)
    details.close()
    router.refresh()
  }

  return (
    <div
      className={
        layout === "grid"
          ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          : "flex flex-col gap-3"
      }
    >
      {contributions.map((contribution) => (
        <Card key={contribution.id} className="p-4 shadow-none">
          <CardContent className="space-y-1 p-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-lg font-medium text-foreground">
                  {contribution.title}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {slugToTitle(contribution.subject)} ·{" "}
                  {slugToTitle(contribution.category)}
                </p>
              </div>
              <ContributionActionsMenu
                contribution={contribution}
                onViewDetails={details.view}
                onSubmitDraft={submitDraft}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {slugToTitle(contribution.educationLevel)}
              {contribution.course
                ? ` · ${slugToTitle(contribution.course)}`
                : ""}
              {contribution.grade
                ? ` · ${slugToTitle(contribution.grade)}`
                : ""}
            </p>

            <div className="flex items-center justify-between">
              <StatusBadge status={contribution.status} />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon
                    icon={ViewIcon}
                    size={14}
                    color="currentColor"
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  {contribution.viewCount.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon
                    icon={Download01Icon}
                    size={14}
                    color="currentColor"
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  {contribution.downloadCount.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
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
          onSubmitDraft={submitDraft}
        />
      ) : null}
    </div>
  )
}
