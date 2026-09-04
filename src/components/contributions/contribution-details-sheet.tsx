"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit03Icon, Link04Icon } from "@hugeicons/core-free-icons"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/profile/status-badge"
import { ContributionListItem } from "@/types/contribution"
import { slugToTitle } from "@/utils/slug"
import Link from "next/link"

interface ContributionDetailsSheetProps {
  contribution: ContributionListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(date: Date | null) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date)
}

export function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">
        {value ?? "—"}
      </span>
    </div>
  )
}

export function ContributionDetailsSheet({
  contribution,
  open,
  onOpenChange,
}: ContributionDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-200 overflow-y-auto p-4">
        <SheetHeader className="p-0">
          <SheetTitle className={"text-lg font-medium"}>
            {contribution.title}
          </SheetTitle>
          {contribution.description ? (
            <SheetDescription>{contribution.description}</SheetDescription>
          ) : null}
        </SheetHeader>

        <div className="flex items-center justify-between">
          <StatusBadge status={contribution.status} />
          {contribution.status === "REJECTED" && contribution.rejectionReason
            ? null
            : null}
        </div>

        {contribution.status === "REJECTED" && contribution.rejectionReason ? (
          <div className="mt-1 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-xs font-medium text-destructive">
              Rejection reason
            </p>
            <p className="mt-1 text-sm text-foreground/80">
              {contribution.rejectionReason}
            </p>
          </div>
        ) : null}

        <Separator className="mt-2 mb-1" />

        <div className="space-y-2 divide-y">
          <DetailRow
            label="Subject"
            value={slugToTitle(contribution.subject)}
          />
          <DetailRow
            label="Category"
            value={slugToTitle(contribution.category)}
          />
          <DetailRow
            label="Educational Level"
            value={slugToTitle(contribution.educationLevel)}
          />
          <DetailRow
            label="Course"
            value={slugToTitle(contribution.course || "")}
          />
          <DetailRow
            label="Grade"
            value={slugToTitle(contribution.grade || "")}
          />
          <DetailRow label="Topic" value={contribution.topic} />
          <DetailRow label="Academic Year" value={contribution.academicYear} />
          <DetailRow
            label="Submitted"
            value={formatDate(contribution.createdAt)}
          />
          <DetailRow
            label="Published"
            value={formatDate(contribution.publishedAt)}
          />
          <DetailRow
            label="Downloads"
            value={contribution.downloadCount.toLocaleString()}
          />
          <DetailRow
            label="Views"
            value={contribution.viewCount.toLocaleString()}
          />
        </div>

        {contribution?.tags && contribution?.tags?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {contribution?.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full font-normal"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2">
          {contribution.status === "PUBLISHED" ? (
            <Button
              nativeButton={false}
              render={
                <Link href={`/notes/${contribution.slug}`}>
                  <HugeiconsIcon
                    icon={Link04Icon}
                    size={16}
                    color="currentColor"
                    strokeWidth={2}
                    className="size-4"
                  />
                  View Note
                </Link>
              }
              className="w-full gap-2"
            ></Button>
          ) : null}
          {(contribution.status === "DRAFT" ||
            contribution.status === "REJECTED" ||
            contribution.status === "PENDING_REVIEW" ||
            contribution.status === "PUBLISHED") && (
            <Button
              nativeButton={false}
              variant="outline"
              render={
                <Link href={`/profile/contributions/${contribution.id}`}>
                  <HugeiconsIcon
                    icon={Edit03Icon}
                    size={16}
                    color="currentColor"
                    strokeWidth={2}
                    className="size-4"
                  />
                  Edit Note
                </Link>
              }
              className="w-full gap-2"
            ></Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Small hook to keep row/card components simple when opening this sheet.
export function useContributionDetailsSheet() {
  const [activeContribution, setActiveContribution] =
    useState<ContributionListItem | null>(null)

  return {
    activeContribution,
    open: activeContribution !== null,
    view: (contribution: ContributionListItem) =>
      setActiveContribution(contribution),
    close: () => setActiveContribution(null),
  }
}
