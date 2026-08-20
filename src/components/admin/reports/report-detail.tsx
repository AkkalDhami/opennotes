import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Link04Icon } from "@hugeicons/core-free-icons"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"

import { ReportStatusBadge } from "@/components/reports/report-status-badge"
import { ResolveReportDialog } from "@/components/reports/resolve-report-dialog"
import { DismissReportDialog } from "@/components/reports/dismiss-report-dialog"
import { RemoveNoteButton } from "@/components/reports/remove-note-button"
import { SectionError } from "@/components/admin/section-error"
import { getReportById } from "@/lib/reports/get-report"
import { REPORT_REASON_LABELS } from "@/validations/report"
import { cn } from "@/lib/utils"
import { Heading } from "@/components/ui/heading"
import { formatDate } from "@/utils/format-date"
import { UserAvatar } from "@/components/admin/users/user-avatar"
import { slugToTitle } from "@/utils/slug"

export async function ReportDetail({ reportId }: { reportId: string }) {
  let report: Awaited<ReturnType<typeof getReportById>>

  try {
    report = await getReportById(reportId)
  } catch (error) {
    console.error("[admin-reports] failed to load report detail", error)
    return <SectionError title="Couldn't load this report." />
  }

  if (!report) {
    notFound()
  }

  const isOpen = report.status === "OPEN"

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/admin/reports"
            className={cn(
              buttonVariants({
                variant: "secondary",
              })
            )}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={14}
              color="currentColor"
              strokeWidth={2}
              className="size-3.5"
            />
            Back to reports
          </Link>
          <div className="flex items-center gap-3">
            <Heading>{REPORT_REASON_LABELS[report.reason]}</Heading>
            <ReportStatusBadge status={report.status} />
          </div>
        </div>

        {isOpen ? (
          <div className="flex flex-wrap gap-2">
            <DismissReportDialog reportId={report.id} />
            <ResolveReportDialog reportId={report.id} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Report Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Reason
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {REPORT_REASON_LABELS[report.reason]}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Explanation
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap text-foreground">
                  {report.explanation || "No additional details were provided."}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Submitted
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {formatDate(report.createdAt, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Reported Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-foreground">
                  {report.note.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {slugToTitle(report.note.subject)} · by{" "}
                  {report.note.contributor.name}
                </p>
              </div>
              {report.note.publishedAt ? (
                <p className="text-sm text-muted-foreground">
                  Published{" "}
                  {formatDate(report.note.publishedAt, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  render={
                    <Link href={`/admin/notes/${report.note.slug}`}>
                      <HugeiconsIcon
                        icon={Link04Icon}
                        size={14}
                        color="currentColor"
                        strokeWidth={2}
                        className="size-3.5"
                      />
                      View Note
                    </Link>
                  }
                />
                {report.note.status !== "REMOVED" ? (
                  <RemoveNoteButton
                    noteId={report.note.id}
                    noteTitle={report.note.title}
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>

          {!isOpen ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Resolution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Reviewed by
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {report.reviewer ? report.reviewer.name : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Reviewed at
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {report.reviewedAt
                      ? formatDate(report.reviewedAt, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Resolution note
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap text-foreground">
                    {report.resolutionNote || "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Reporter
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.reporter ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={report.reporter.name}
                      avatarUrl={report.reporter.avatar ?? ""}
                      className="size-10"
                    />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {report.reporter.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{report.reporter.username}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/users/${report.reporter.username}`}
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                  >
                    View Profile
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Anonymous</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
