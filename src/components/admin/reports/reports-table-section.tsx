import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { InboxIcon, Link04Icon } from "@hugeicons/core-free-icons"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { ReportStatusBadge } from "@/components/reports/report-status-badge"
import { SectionError } from "@/components/admin/section-error"
import { getReports } from "@/lib/reports/get-reports"
import { REPORT_REASON_LABELS } from "@/validations/report"
import { Route } from "next"
import { formatDate } from "@/utils/format-date"

type ReportStatusFilter = "OPEN" | "RESOLVED" | "DISMISSED"

export async function ReportsTableSection({
  status,
  search,
  page,
  sort,
}: {
  status?: ReportStatusFilter
  search: string
  page: number
  sort: "newest" | "oldest"
}) {
  let result: Awaited<ReturnType<typeof getReports>>

  try {
    result = await getReports({ status, search, page, sort })
  } catch (error) {
    console.error("[admin-reports] failed to load reports", error)
    return <SectionError title="Couldn't load reports." />
  }

  if (result.items.length === 0) {
    const isUnfiltered = !status && !search
    const isOpenFilter = status === "OPEN" && !search

    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
        <HugeiconsIcon
          icon={InboxIcon}
          size={32}
          color="currentColor"
          strokeWidth={1.5}
          className="size-8 text-muted-foreground"
        />
        {isOpenFilter ? (
          <>
            <p className="text-sm font-medium text-foreground">
              No open reports
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Everything looks good. There are no reports waiting for review.
            </p>
          </>
        ) : isUnfiltered ? (
          <>
            <p className="text-sm font-medium text-foreground">
              No reports yet
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Reports from students and visitors will appear here when they need
              something reviewed.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No reports match your filters.
          </p>
        )}
      </div>
    )
  }

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (search) params.set("search", search)
    if (sort !== "newest") params.set("sort", sort)
    params.set("page", String(targetPage))
    return `/admin/reports?${params.toString()}`
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-16">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium text-foreground">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {REPORT_REASON_LABELS[report.reason]}
                  </Link>
                </TableCell>
                <TableCell className="max-w-55 truncate text-muted-foreground">
                  {report.note.title}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {report.reporter ? report.reporter.name : "Anonymous"}
                </TableCell>
                <TableCell>
                  <ReportStatusBadge status={report.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(report.createdAt, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="text-sm font-medium text-foreground"
                  >
                    <HugeiconsIcon
                      icon={Link04Icon}
                      size={24}
                      color="currentColor"
                      strokeWidth={2}
                      className="size-4"
                    />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {result.totalPages > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious>
                <Link
                  href={buildHref(Math.max(1, page - 1)) as Route}
                  aria-disabled={page <= 1}
                />
              </PaginationPrevious>
            </PaginationItem>
            {Array.from({ length: result.totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={page === i + 1}>
                  <Link href={buildHref(i + 1) as Route} /> {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext>
                <Link
                  href={
                    buildHref(Math.min(result.totalPages, page + 1)) as Route
                  }
                  aria-disabled={page >= result.totalPages}
                />
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}
