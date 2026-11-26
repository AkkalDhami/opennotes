"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  Download01Icon,
  FolderAddIcon,
} from "@hugeicons/core-free-icons"
import { PublicNote } from "@/types/note"
import { formatFileSize, formatCompactNumber } from "@/lib/notes/format"
import { cn } from "@/lib/utils"
import { DownloadNoteButton } from "@/components/shared/download-note-button"
import { buttonVariants } from "@/components/ui/button"
import { Route } from "next"
import { NoiseTexture } from "@/components/ui/noise-texture"
import { Tilt } from "@/components/ui/tilt"
import { formatNoteMeta } from "@/utils/format"
import { BookmarkButton } from "@/components/shared/bookmark-button"
import { useModal } from "@/hooks/use-modal-store"

import { getEducationNames } from "@/utils/get-edu-name"
import { VerifiedUserAvatar } from "@/components/shared/verified-user-avatar"

interface NoteCardProps {
  note: PublicNote
  from?: "contributor"
}

export function NoteCard({ note, from }: NoteCardProps) {
  const { open } = useModal()
  const shouldReduceMotion = useReducedMotion()

  const { subject, educationLevel, course, grade } = getEducationNames({
    subject: note.subject,
    educationLevel: note.educationLevel,
    course: note.course,
    grade: note.grade,
  })

  return (
    <Tilt isRevese className="mb-4 break-inside-avoid">
      <motion.div
        whileHover={
          shouldReduceMotion
            ? undefined
            : { transition: { duration: 0.2, ease: "easeOut" } }
        }
        className="group relative flex flex-col space-y-2 overflow-hidden rounded-lg border bg-card p-4 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <>
          <NoiseTexture noiseOpacity={0.2} />
          <Link
            href={`/notes/${note.slug}`}
            className="line-clamp-2 w-auto pr-8 text-lg leading-snug font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            {note.title}
          </Link>

          <BookmarkButton
            noteId={note.id}
            initialBookmarked={note.isBookmarked}
            className="group/bookmark absolute top-3 right-4 z-10"
          />

          <button
            type="button"
            aria-label="Add note to collections"
            className={cn(
              "absolute top-14 right-6 z-10",
              "flex size-5 items-center justify-center rounded-full",
              "bg-muted text-muted-foreground hover:text-primary"
            )}
            onClick={() =>
              open("add-note-to-collections", {
                addNoteToCollectionsDialog: {
                  noteId: note.id,
                  noteTitle: note.title,
                },
              })
            }
          >
            <HugeiconsIcon
              icon={FolderAddIcon}
              size={24}
              color="currentColor"
              strokeWidth={2}
            />
          </button>

          <p className="pr-8 text-sm font-medium text-muted-foreground">
            {formatNoteMeta([educationLevel, course, grade, subject])}
          </p>

          {from !== "contributor" && (
            <div className="mt-2 flex items-center gap-2">
              <VerifiedUserAvatar
                displayName={note.contributor.name}
                avatarUrl={note.contributor.avatarUrl}
                emailVerified={true}
                size="sm"
              />
              <div className="flex flex-col">
                <Link
                  href={`/contributors/${note.contributor.username}` as Route}
                  className="text-base font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
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
                className="size-4 -translate-x-0.5"
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
              View Note
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={14}
                color="currentColor"
                strokeWidth={2}
                className="size-4"
              />
            </Link>
          </div>
        </>
      </motion.div>
    </Tilt>
  )
}
