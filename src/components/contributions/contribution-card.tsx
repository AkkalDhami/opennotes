"use client"

import Link from "next/link"
import { Route } from "next"
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
import { formatDate, formatRelativeTime } from "@/utils/format-date"
import { submitDraftContribution } from "@/lib/user/submit-contribution"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Tilt } from "@/components/ui/tilt"
import {
  getCategoryName,
  getCourseName,
  getEducationLevelName,
  getGradeName,
  getSubjectName,
} from "@/utils/get-edu-name"
import { formatNoteMeta } from "@/utils/format"

interface ContributionCardListProps {
  contributions: ContributionListItem[]
  layout?: "stack" | "grid"
}

export function ContributionCardList({
  contributions,
  layout = "grid",
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
        <Tilt isRevese={true} key={contribution.id + "-tilt"}>
          <Card key={contribution.id} className="p-4 shadow-none">
            <CardContent className="space-y-0.5 p-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <Link
                    href={`/notes/${contribution.slug}`}
                    target="_blank"
                    className="truncate text-lg font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
                  >
                    {contribution.title}
                  </Link>
                  <p className="truncate text-sm text-muted-foreground">
                    {formatNoteMeta([
                      getSubjectName(contribution.subject),
                      getCategoryName(contribution.category),
                    ])}
                  </p>
                </div>
                <ContributionActionsMenu
                  contribution={contribution}
                  onViewDetails={details.view}
                  onSubmitDraft={submitDraft}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                {formatNoteMeta([
                  getEducationLevelName(contribution.educationLevel),
                  getCourseName(contribution.course),
                  getGradeName(contribution.grade),
                ])}
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

              {contribution.status === "REJECTED" &&
              contribution.rejectionReason ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
                  <p className="text-xs font-medium text-destructive">
                    Rejection reason
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/80">
                    {contribution.rejectionReason}
                  </p>
                </div>
              ) : null}

              <p className="inline-flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
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
            </CardContent>
          </Card>
        </Tilt>
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

export function ContributionList({
  contributions,
}: {
  contributions: ContributionListItem[]
}) {
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
    <>
      <ul className="border-t">
        {contributions.map((contribution) => (
          <li
            key={contribution.id}
            className="grid gap-0 border-b py-4 transition-colors md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div className="space-y-1">
              <h3 className="truncate text-lg leading-snug font-medium text-foreground">
                <Link
                  href={
                    (contribution.status === "PUBLISHED"
                      ? `/notes/${contribution.slug}`
                      : `/profile/contributions/${contribution.id}`) as Route
                  }
                  target={
                    contribution.status === "PUBLISHED" ? "_blank" : undefined
                  }
                  className="underline-offset-2 hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {contribution.title}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatNoteMeta([
                  getEducationLevelName(contribution.educationLevel),
                  getCourseName(contribution.course),
                  getGradeName(contribution.grade),
                  getSubjectName(contribution.subject),
                  getCategoryName(contribution.category),
                ])}
              </p>
              {contribution.status === "REJECTED" &&
              contribution.rejectionReason ? (
                <p className="line-clamp-1 pt-1 text-xs text-destructive">
                  {contribution.rejectionReason}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 md:h-full md:flex-col md:items-end md:justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={contribution.status} />
                <ContributionActionsMenu
                  contribution={contribution}
                  onViewDetails={details.view}
                  onSubmitDraft={submitDraft}
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

            <div className="flex flex-wrap items-center gap-3 md:col-start-1">
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
              {contribution.status === "PUBLISHED" &&
              contribution.publishedAt ? (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <HugeiconsIcon
                    icon={Calendar04Icon}
                    size={14}
                    color="currentColor"
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  Published {formatRelativeTime(contribution.publishedAt)}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {details.activeContribution ? (
        <ContributionDetailsSheet
          contribution={details.activeContribution}
          open={details.open}
          onOpenChange={(open) => !open && details.close()}
          onSubmitDraft={submitDraft}
        />
      ) : null}
    </>
  )
}
