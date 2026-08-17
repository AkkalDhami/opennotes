import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  ViewIcon,
  PencilEdit01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NoteStatusBadge } from "./note-status-badge"
import { DashboardSectionError } from "./dashboard-section-error"
import {
  getRecentNotes,
  RecentNote,
} from "@/lib/admin/dashboard/get-recent-notes"
import { Route } from "next"
import { slugToTitle } from "@/utils/slug"

export async function RecentNotesSection() {
  let notes: RecentNote[]

  try {
    notes = await getRecentNotes(8)
  } catch (error) {
    console.error("[admin-dashboard] failed to load recent notes", error)
    return <DashboardSectionError title="Couldn't load recent notes." />
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h3 className="text-lg font-medium">Recent Notes</h3>
      {notes.length === 0 ? (
        <p className="px-6 py-6 text-center text-sm text-muted-foreground">
          No notes submitted yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Contributor</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Downloads</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="max-w-55 truncate font-medium text-foreground">
                    {note.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {note.contributorName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {slugToTitle(note.subject)}
                  </TableCell>
                  <TableCell>
                    <NoteStatusBadge status={note.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {note.downloadCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {note.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <HugeiconsIcon
                              icon={MoreVerticalIcon}
                              size={16}
                              color="currentColor"
                              strokeWidth={2}
                              className="size-4"
                            />
                            <span className="sr-only">
                              Open actions for {note.title}
                            </span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          nativeButton={false}
                          render={
                            <Link
                              href={`/notes/${note.slug}`}
                              target="_blank"
                              className="gap-2"
                            >
                              <HugeiconsIcon
                                icon={ViewIcon}
                                size={16}
                                color="currentColor"
                                strokeWidth={2}
                                className="size-4"
                              />
                              View
                            </Link>
                          }
                        />
                        <DropdownMenuItem
                          nativeButton={false}
                          render={
                            <Link
                              href={`/admin/notes/${note.id}/edit` as Route}
                              className="gap-2"
                              target="_blank"
                            >
                              <HugeiconsIcon
                                icon={PencilEdit01Icon}
                                size={16}
                                color="currentColor"
                                strokeWidth={2}
                                className="size-4"
                              />
                              Edit
                            </Link>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          nativeButton={false}
          render={
            <Link href="/admin/notes">
              View all notes
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
    </div>
  )
}
