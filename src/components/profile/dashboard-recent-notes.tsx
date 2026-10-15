import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/profile/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ContributionListItem } from "@/types/contribution"
import { slugToTitle } from "@/utils/slug"
import { formatDate } from "@/utils/format-date"
import { Route } from "next"

interface DashboardRecentNotesProps {
  notes: ContributionListItem[]
}

function noteHref(note: ContributionListItem): Route {
  if (note.status === "PUBLISHED") {
    return `/notes/${note.slug}` as Route
  }
  return `/profile/contributions/${note.id}/preview` as Route
}

export function DashboardRecentNotes({ notes }: DashboardRecentNotesProps) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          Recent notes
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          nativeButton={false}
          render={
            <Link href={"/profile/notes" as Route}>
              View all
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={14}
                color="currentColor"
                strokeWidth={2}
                className="size-3.5"
              />
            </Link>
          }
        />
      </div>

      {notes.length === 0 ? (
        <div className="space-y-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t shared any notes yet.
          </p>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/contribution">Share a note</Link>}
          />
        </div>
      ) : (
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Downloads</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="max-w-55">
                    <Link
                      href={noteHref(note)}
                      className="truncate font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {note.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {slugToTitle(note.subject)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={note.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {note.viewCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {note.downloadCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(note.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </section>
  )
}
