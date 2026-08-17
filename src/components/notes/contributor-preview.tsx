import Link from "next/link"
import { PublicContributor, PublicNote } from "@/types/note"
import { getInitials } from "@/utils/get-initials"
import { cn } from "@/lib/utils"
import { CheckmarkBadge01Icon, Link04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SubHeading } from "@/components/ui/sub-heading"
import { sliceContent } from "@/utils/slice-content"
import { NoteCard } from "./note-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { buttonVariants } from "@/components/ui/button"

interface ContributorPreviewProps {
  contributor: PublicContributor
  notes?: PublicNote[]
}

export function ContributorPreview({
  contributor,
  notes,
}: ContributorPreviewProps) {
  return (
    <div className="space-y-4">
      <SubHeading as="h3">Contributor Profile:</SubHeading>

      <div className="space-y-4 rounded-[16px] border p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-18 border">
              <AvatarImage
                src={contributor.avatarUrl ?? undefined}
                alt={`${sliceContent(contributor.name)}'s avatar`}
              />
              <AvatarFallback className="text-2xl font-semibold">
                {getInitials(contributor.name)}
              </AvatarFallback>
            </Avatar>
            <HugeiconsIcon
              icon={CheckmarkBadge01Icon}
              size={24}
              color="currentColor"
              strokeWidth={2}
              className={cn(
                "size-5 fill-blue-600 stroke-blue-600 text-white",
                "absolute -right-0.5 bottom-0.5 flex items-center justify-center rounded-full bg-background"
              )}
            />
          </div>
          <div className="min-w-0">
            <Link
              href={`/contributors/${contributor.username}`}
              className="flex flex-wrap items-center gap-3 truncate text-lg font-medium text-foreground underline-offset-2 hover:underline"
            >
              {contributor.name}

              <HugeiconsIcon
                icon={Link04Icon}
                size={24}
                color="currentColor"
                strokeWidth={2}
              />
            </Link>
            <p className="block truncate text-base text-muted-foreground">
              @{contributor.username}
              {typeof contributor.publishedNoteCount === "number" &&
                ` · ${contributor.publishedNoteCount} note${
                  contributor.publishedNoteCount === 1 ? "" : "s"
                }`}
            </p>
          </div>
        </div>

        <Link
          href={`/contributors/${contributor.username}`}
          className={cn(
            buttonVariants({
              variant: "brand",
            }),
            "w-full"
          )}
        >
          View Profile
        </Link>
      </div>

      {notes && notes?.length > 0 && (
        <ScrollArea className="h-140 space-y-6 pb-3">
          <SubHeading as="h3" className="mb-4">
            More from {sliceContent(contributor.name)}:
          </SubHeading>

          <div className="space-y-4">
            {notes?.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
