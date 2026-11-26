"use client"

import * as React from "react"
import Link from "next/link"
import { Route } from "next"
import { motion, useReducedMotion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  Download01Icon,
  FolderAddIcon,
} from "@hugeicons/core-free-icons"

import { PublicNote } from "@/types/note"
import { formatFileSize, formatCompactNumber } from "@/lib/notes/format"
import { Button, buttonVariants } from "@/components/ui/button"
import { DownloadNoteButton } from "@/components/shared/download-note-button"
import { BookmarkButton } from "@/components/shared/bookmark-button"
import { getEducationNames } from "@/utils/get-edu-name"
import { formatNoteMeta } from "@/utils/format"
import { useModal } from "@/hooks/use-modal-store"
import { cn } from "@/lib/utils"
import { VerifiedUserAvatar } from "@/components/shared/verified-user-avatar"

interface NoteListItemProps {
  note: PublicNote
  /** Same meaning as on NoteCard: hides the contributor block on a contributor's own page. */
  from?: "contributor"
  index?: number
  reveal?: boolean
}

/**
 * Wrap rows in this so the list gets its top rule and the right semantics.
 *
 *   <NoteList>
 *     {notes.map((note) => (
 *       <NoteListItem key={note.id} note={note} from="contributor" />
 *     ))}
 *   </NoteList>
 */
export function NoteList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ul role="list" className={cn("border-t", className)}>
      {children}
    </ul>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-14 flex-col text-right">
      <dt className="order-2 text-xs text-muted-foreground">{label}</dt>
      <dd className="order-1 text-base font-medium text-foreground tabular-nums">
        {value}
      </dd>
    </div>
  )
}

const plural = (count: number, one: string, many: string) =>
  count === 1 ? one : many

export function NoteListItem({
  note,
  from,
  index = 0,
  reveal = false,
}: NoteListItemProps) {
  const { open } = useModal()
  const shouldReduceMotion = useReducedMotion()
  const shouldReveal = reveal && !shouldReduceMotion

  const { subject, educationLevel, course, grade } = getEducationNames({
    subject: note.subject,
    educationLevel: note.educationLevel,
    course: note.course,
    grade: note.grade,
  })

  const pageCount = note.pageCount ?? 0

  return (
    <motion.li
      initial={shouldReveal ? { opacity: 0, y: 10 } : undefined}
      whileInView={shouldReveal ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: Math.min(index, 8) * 0.05,
      }}
      className="group border-b py-4"
    >
      <div className="grid gap-x-10 gap-y-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="min-w-0">
            <Link
              href={`/notes/${note.slug}`}
              className="line-clamp-1 text-lg leading-snug font-medium text-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {note.title}
            </Link>
          </h3>

          <p className="text-sm font-medium text-muted-foreground">
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
              <div className="flex min-w-0 flex-col items-baseline gap-x-2">
                <Link
                  href={`/contributors/${note.contributor.username}` as Route}
                  className="text-sm font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                  {note.contributor.name}
                </Link>
                <span className="text-sm text-muted-foreground">
                  @{note.contributor.username}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <dl className="flex flex-wrap items-center gap-3 sm:grid sm:grid-cols-4 sm:gap-y-0 md:flex md:gap-x-6">
            <Stat
              value={formatCompactNumber(note.downloadCount)}
              label={plural(note.downloadCount, "download", "downloads")}
            />
            <Stat
              value={formatCompactNumber(note.viewCount)}
              label={plural(note.viewCount, "view", "views")}
            />
            <Stat
              value={formatFileSize(note.fileSizeBytes ?? 0)}
              label="file size"
            />
            <Stat
              value={formatCompactNumber(pageCount)}
              label={plural(pageCount, "page", "pages")}
            />
          </dl>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex items-center gap-2">
              <BookmarkButton
                noteId={note.id}
                initialBookmarked={note.isBookmarked}
              />

              <Button
                variant="ghost"
                size="icon"
                aria-label="Add note to collections"
                className={cn(
                  "text-muted-foreground hover:bg-transparent hover:text-primary dark:hover:bg-transparent"
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
                  size={18}
                  color="currentColor"
                  strokeWidth={2}
                  className="size-5"
                />
              </Button>
            </div>

            <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    </motion.li>
  )
}
