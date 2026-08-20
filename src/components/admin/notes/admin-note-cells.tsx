import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkBadge01Icon,
  Download01Icon,
  File01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  NOTE_STATUS_DISPLAY,
  SOURCE_TYPE_DISPLAY,
} from "@/configs/note-display"
import {
  formatCompactNumber,
  formatExactNumber,
  formatFullTimestamp,
  formatNoteMeta,
  formatShortDate,
} from "@/utils/format"
import { AdminNoteListItem } from "@/types/note"
import { slugToTitle } from "@/utils/slug"

export function NoteTitleBlock({ note }: { note: AdminNoteListItem }) {
  const meta = formatNoteMeta([
    slugToTitle(note.educationLevel ?? ""),
    slugToTitle(note.course ?? ""),
    slugToTitle(note.grade ?? ""),
  ])
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={File01Icon}
          size={16}
          color="currentColor"
          strokeWidth={2}
          className="size-4"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {note.title}
        </p>
        {meta && (
          <p className="truncate text-xs text-muted-foreground">{meta}</p>
        )}
        {note.tags.length > 0 && (
          <div className="mt-1 flex gap-1">
            {note.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="px-1.5 py-0 text-[10px] font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ContributorBlock({ note }: { note: AdminNoteListItem }) {
  const { contributor } = note
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="size-8">
        <AvatarImage src={contributor.avatarUrl ?? undefined} alt="" />
        <AvatarFallback>
          {contributor.name.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
          {contributor.name}
          {contributor.isVerified && (
            <>
              <HugeiconsIcon
                icon={CheckmarkBadge01Icon}
                size={13}
                color="currentColor"
                strokeWidth={2}
                className="size-3.5 shrink-0 text-blue-500"
              />
              <span className="sr-only">Verified contributor</span>
            </>
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          @{contributor.username}
        </p>
      </div>
    </div>
  )
}

export function SourceCell({ note }: { note: AdminNoteListItem }) {
  const display = SOURCE_TYPE_DISPLAY[note.sourceType]
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant="outline" className="w-fit font-normal">
        {display.label}
      </Badge>
      {display.attributionLabel && note.sourceAuthor && (
        <span className="text-xs text-muted-foreground">
          {display.attributionLabel}: {note.sourceAuthor}
        </span>
      )}
      {note.sourceUrl && (
        <a
          href={note.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          View source
        </a>
      )}
    </div>
  )
}

export function StatusBadge({ note }: { note: AdminNoteListItem }) {
  const display = NOTE_STATUS_DISPLAY[note.status]
  return (
    <Badge
      variant={display.badgeVariant}
      className="gap-1 font-normal text-white"
    >
      <HugeiconsIcon
        icon={display.icon}
        size={12}
        color="currentColor"
        strokeWidth={2}
        className="size-3"
      />
      {display.label}
    </Badge>
  )
}

export function DownloadsCell({ note }: { note: AdminNoteListItem }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
            <HugeiconsIcon
              icon={Download01Icon}
              size={14}
              color="currentColor"
              strokeWidth={2}
              className="size-3.5 text-muted-foreground"
            />
            {formatCompactNumber(note.downloadCount)}
          </span>
        }
      />
      <TooltipContent>
        {formatExactNumber(note.downloadCount)} downloads
      </TooltipContent>
    </Tooltip>
  )
}

export function PublishedCell({ note }: { note: AdminNoteListItem }) {
  if (!note.publishedAt) {
    return <span className="text-sm text-muted-foreground">Not published</span>
  }
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="text-sm text-foreground">
            {formatShortDate(note.publishedAt)}
          </span>
        }
      />
      <TooltipContent>{formatFullTimestamp(note.publishedAt)}</TooltipContent>
    </Tooltip>
  )
}
