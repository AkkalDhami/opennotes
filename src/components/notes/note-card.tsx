import Link from "next/link";
import {
  File01Icon,
  ViewIcon,
  TradeUpIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Note } from "@/data/notes";
import { HugeiconsIcon } from "@hugeicons/react";

interface NoteCardProps {
  note: Note;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return count.toString();
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link
      href={`/notes/${note.slug}`}
      aria-label={`${note.title}, ${[note.level, note.subject]
        .filter(Boolean)
        .join(" · ")}, by ${note.contributor.name}`}
      className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-5 text-card-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          <HugeiconsIcon
            icon={File01Icon}
            size={24}
            color="currentColor"
            strokeWidth={2}
            className="size-3.5"
          />
          PDF
        </span>

        {note.trending ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500">
            <HugeiconsIcon
              icon={TradeUpIcon}
              size={24}
              color="currentColor"
              strokeWidth={2}
              className="size-3.5"
            />
            Trending
          </span>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <h3 className="line-clamp-2 leading-snug font-medium text-foreground">
          {note.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {[note.level, note.subject].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="size-6 shrink-0">
            <AvatarImage src={note.contributor.avatarUrl} alt="" />
            <AvatarFallback className="text-[10px]">
              {initials(note.contributor.name)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-sm text-muted-foreground">
            {note.contributor.name}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <HugeiconsIcon
              icon={Download01Icon}
              size={24}
              color="currentColor"
              strokeWidth={2}
              className="size-3.5"
            />
            {formatCount(note.downloads)}
          </span>
          {note.views ? (
            <span className="inline-flex items-center gap-1">
              <HugeiconsIcon
                icon={ViewIcon}
                size={24}
                color="currentColor"
                strokeWidth={2}
                className="size-3.5"
              />
              {formatCount(note.views)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
