import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  CheckmarkBadge01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import { PublicNote } from "@/types/note"
import { formatFileSize, formatCompactNumber } from "@/lib/notes/format"
import { slugToTitle } from "@/utils/slug"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { getInitials } from "@/utils/get-initials"
import { cn } from "@/lib/utils"
import { DownloadNoteButton } from "@/components/shared/download-note-button"
import { buttonVariants } from "@/components/ui/button"
import { Route } from "next"
import { NoiseTexture } from "@/components/ui/noise-texture"
import { Tilt } from "@/components/ui/tilt"
import { formatNoteMeta } from "@/utils/format"
import { BookmarkButton } from "@/components/shared/bookmark-button"

interface NoteCardProps {
  note: PublicNote
  from?: "contributor"
}

export function NoteCard({ note, from }: NoteCardProps) {
  return (
    <Tilt isRevese>
      <div className="group relative flex h-full flex-col space-y-2 overflow-hidden rounded-lg border bg-card p-4 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <>
          <NoiseTexture noiseOpacity={0.2} />
          <Link
            href={`/notes/${note.slug}`}
            className="line-clamp-2 pr-8 text-lg leading-snug font-medium text-foreground underline-offset-2 hover:underline"
          >
            {note.title}
          </Link>

          <BookmarkButton
            noteId={note.id}
            initialBookmarked={note.isBookmarked}
            className="top-4"
          />

          <p className="text-sm font-medium text-muted-foreground">
            {formatNoteMeta([
              slugToTitle(note.educationLevel ?? ""),
              slugToTitle(note.course ?? ""),
              note.grade ? slugToTitle(note.grade) : "",
              slugToTitle(note.subject),
            ])}
          </p>

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
                <p className="text-sm text-muted-foreground">
                  @{note.contributor.username}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            {formatNoteMeta([
              `${formatCompactNumber(note.downloadCount)} ${note.downloadCount > 1 ? "downloads" : "download"}`,
              `${formatCompactNumber(note.viewCount)} ${note.viewCount > 1 ? "views" : "view"}`,
              `${formatFileSize(note.fileSizeBytes ?? 0)}`,
              `${formatCompactNumber(note.pageCount ?? 0)} ${note.pageCount === 1 ? "page" : "pages"}`,
            ])}
          </div>

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
        </>
      </div>
    </Tilt>
  )
}
