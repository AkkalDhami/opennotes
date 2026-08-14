import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { getInitials } from "./utils";

export interface ContributorCardProps {
  id: string
  displayName: string
  username: string
  avatarUrl: string | null
  publishedNoteCount: number
  topSubject?: string | null
  rank?: 1 | 2 | 3
}

const RANK_MEDAL: Record<1 | 2 | 3, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
}

const RANK_TEXT: Record<1 | 2 | 3, string> = {
  1: "1st place contributor",
  2: "2nd place contributor",
  3: "3rd place contributor",
}

export function ContributorCard({
  displayName,
  username,
  avatarUrl,
  publishedNoteCount,
  topSubject,
  rank,
}: ContributorCardProps) {
  const isFeatured = Boolean(rank)

  return (
    <Link
      href={`/contributors/${username}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="h-full border-border bg-card transition-colors group-hover:border-foreground/20">
        <CardContent
          className={
            isFeatured
              ? "flex flex-col items-center gap-3 py-8 text-center"
              : "flex flex-col items-center gap-2 py-6 text-center"
          }
        >
          {rank && (
            <span
              className="text-2xl"
              role="img"
              aria-label={RANK_TEXT[rank]}
            >
              {RANK_MEDAL[rank]}
            </span>
          )}

          <Avatar className={isFeatured ? "h-20 w-20" : "h-16 w-16"}>
            <AvatarImage
              src={avatarUrl ?? undefined}
              alt={`${displayName}'s avatar`}
            />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>

          <div>
            <p className="font-medium text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground">@{username}</p>
          </div>

          <p className="text-sm font-medium text-foreground">
            {publishedNoteCount.toLocaleString()}{" "}
            {publishedNoteCount === 1 ? "Note Shared" : "Notes Shared"}
          </p>

          {topSubject && (
            <p className="text-xs text-muted-foreground">{topSubject}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
