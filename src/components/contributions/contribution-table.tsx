"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon } from "@hugeicons/core-free-icons"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/profile/status-badge"
import { ContributionActionsMenu } from "@/components/contributions/contribution-actions-menu"
import {
  ContributionDetailsSheet,
  useContributionDetailsSheet,
} from "@/components/contributions/contribution-details-sheet"
import { ContributionListItem } from "@/types/contribution"
import { slugToTitle } from "@/utils/slug"
import { formatDate } from "@/utils/format-date"
import { submitDraftContribution } from "@/lib/user/submit-contribution"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface ContributionTableProps {
  contributions: ContributionListItem[]
}

export function ContributionTable({ contributions }: ContributionTableProps) {
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
    <div className="overflow-x-auto rounded-lg border p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Note</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Education</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Downloads</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-10 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contributions.map((contribution) => (
            <TableRow key={contribution.id}>
              <TableCell className="max-w-xs">
                <div className="space-y-0.5">
                  <p className="truncate font-medium text-foreground">
                    {contribution.title}
                  </p>
                  {contribution.description ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {contribution.description}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-sm text-foreground/80">
                {slugToTitle(contribution.subject)}
              </TableCell>
              <TableCell className="text-sm text-foreground/80">
                {slugToTitle(contribution.educationLevel)}
                {contribution.course
                  ? ` · ${slugToTitle(contribution.course)}`
                  : ""}
              </TableCell>
              <TableCell>
                <StatusBadge status={contribution.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground tabular-nums">
                {contribution.viewCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-center text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HugeiconsIcon
                    icon={Download01Icon}
                    size={14}
                    color="currentColor"
                    strokeWidth={2}
                    className="size-3.5 text-muted-foreground"
                  />
                  {contribution.downloadCount.toLocaleString()}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(contribution.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <ContributionActionsMenu
                  contribution={contribution}
                  onViewDetails={details.view}
                  onSubmitDraft={submitDraft}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
