import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ContributorNotes } from "@/components/admin/contributors/contributor-notes"
import {
  getContributorByUsername,
  getContributorPublishedNotes,
} from "@/lib/admin/queries"
import { formatJoinedDate, getInitials } from "./utils";

interface ContributorDetailPageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({
  params,
}: ContributorDetailPageProps): Promise<Metadata> {
  const { username } = await params
  const contributor = await getContributorByUsername(username)

  if (!contributor) {
    return { title: "Contributor Not Found | NotesApp" }
  }

  return {
    title: `${contributor.displayName} (@${contributor.username}) | Contributors | NotesApp`,
    description: `${contributor.displayName} has shared ${contributor.publishedNoteCount} note${
      contributor.publishedNoteCount === 1 ? "" : "s"
    } on NotesApp.`,
  }
}

export default async function ContributorDetailPage({
  params,
  searchParams,
}: ContributorDetailPageProps) {
  const { username } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const contributor = await getContributorByUsername(username)
  if (!contributor) notFound()

  const { notes, totalPages } = await getContributorPublishedNotes(
    contributor.id,
    page
  )

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-12">
      <Link
        href="/contributors"
        className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        ← All Contributors
      </Link>

      <section className="mt-6 flex flex-col items-center gap-3 text-center">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={contributor.avatarUrl ?? undefined}
            alt={`${contributor.displayName}'s avatar`}
          />
          <AvatarFallback className="text-lg">
            {getInitials(contributor.displayName)}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {contributor.displayName}
          </h1>
          <p className="text-muted-foreground">@{contributor.username}</p>
        </div>

        {contributor.bio && (
          <p className="max-w-md text-sm text-muted-foreground">
            {contributor.bio}
          </p>
        )}

        <p className="text-sm font-medium text-foreground">
          {contributor.publishedNoteCount.toLocaleString()}{" "}
          {contributor.publishedNoteCount === 1
            ? "Note Shared"
            : "Notes Shared"}
        </p>

        <p className="text-xs text-muted-foreground">
          Joined {formatJoinedDate(contributor.joinedAt)}
        </p>

        {contributor.subjects.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-center gap-2"
            aria-label="Subjects contributed"
          >
            {contributor.subjects.map((subject) => (
              <Badge key={subject} variant="secondary">
                {subject}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">
          Published Notes
        </h2>
        <div className="mt-4">
          <ContributorNotes
            notes={notes}
            page={page}
            totalPages={totalPages}
            username={contributor.username}
          />
        </div>
      </section>
    </main>
  )
}
