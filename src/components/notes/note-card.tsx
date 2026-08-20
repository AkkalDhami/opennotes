import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  CheckmarkBadge01Icon,
  Download01Icon,
  File01Icon,
  File02Icon,
} from "@hugeicons/core-free-icons"
import { PublicNote } from "@/types/note"
import { formatFileSize, formatCompactNumber } from "@/lib/notes/format"
import { slugToTitle } from "@/utils/slug"
import { formatDate } from "@/utils/format-date"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { getInitials } from "@/utils/get-initials"
import { cn } from "@/lib/utils"
import { DownloadNoteButton } from "@/components/shared/download-note-button"
import { buttonVariants } from "@/components/ui/button"
import { Route } from "next"

interface NoteCardProps {
  note: PublicNote
  from?: "contributor"
}

export function NoteCard({ note, from }: NoteCardProps) {
  return (
    <div className="group flex h-full flex-col space-y-2 rounded-lg border bg-card p-4 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <Link
        href={`/notes/${note.slug}`}
        className="line-clamp-2 text-lg leading-snug font-medium text-foreground underline-offset-2 hover:underline"
      >
        {note.title}
      </Link>

      <p className="text-sm font-medium text-muted-foreground">
        {slugToTitle(note.educationLevel || "")} {" · "}
        {slugToTitle(note.course || "")}
        {note.grade ? ` · ${slugToTitle(note.grade)}` : ""}
        {" · "}
        {slugToTitle(note.subject)}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <HugeiconsIcon
              icon={Download01Icon}
              size={14}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
            />
            {formatCompactNumber(note.downloadCount)}
          </span>
          {note.pageCount && (
            <span className="inline-flex items-center gap-1">
              <HugeiconsIcon
                icon={File01Icon}
                size={14}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              {formatCompactNumber(note.pageCount)}
              {note.pageCount === 1 ? " page" : " pages"}
            </span>
          )}

          {note.fileSizeBytes != null && (
            <span className="inline-flex items-center gap-1">
              <HugeiconsIcon
                icon={File02Icon}
                size={14}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
              {formatFileSize(note.fileSizeBytes)}
            </span>
          )}
        </div>

        <span className="text-sm text-muted-foreground">
          {formatDate(note.publishedAt)}
        </span>
      </div>

      {from !== "contributor" && (
        <div className="mt-2 flex items-center gap-2">
          <div className="relative">
            <Avatar className="size-10 border">
              <AvatarImage
                src={note.contributor.avatarUrl ?? undefined}
                alt={`${note.contributor.name}'s avatar`}
              />
              <AvatarFallback className="text-lg">
                {getInitials(note.contributor.name)}
              </AvatarFallback>
            </Avatar>
            <HugeiconsIcon
              icon={CheckmarkBadge01Icon}
              size={14}
              color="currentColor"
              strokeWidth={2}
              className={cn(
                "size-4 fill-blue-600 stroke-blue-600 text-white",
                "absolute -right-0.5 bottom-0.5 flex items-center justify-center rounded-full bg-background"
              )}
            />
          </div>
          <div className="flex flex-col">
            <Link
              href={`/contributors/${note.contributor.username}` as Route}
              className="text-base font-medium text-foreground underline-offset-2 hover:underline"
            >
              {note.contributor.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              @{note.contributor.username}
            </p>
          </div>
        </div>
      )}
      <div className="mt-2 grid w-full items-center gap-2 sm:grid-cols-2">
        <DownloadNoteButton
          noteId={note.id}
          className="inline-flex items-center gap-1 text-sm font-normal"
        >
          <HugeiconsIcon
            icon={Download01Icon}
            size={14}
            color="currentColor"
            strokeWidth={2}
            className="size-4"
          />
          Download PDF
        </DownloadNoteButton>

        <Link
          href={`/notes/${note.slug}`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "inline-flex items-center gap-2 text-sm font-normal"
          )}
        >
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={14}
            color="currentColor"
            strokeWidth={2}
            className="size-4"
          />
          View Note
        </Link>
      </div>
    </div>
  )
}
