import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ContributorNotes } from "@/components/admin/contributors/contributor-notes"
import {
  getContributorByUsername,
  getContributorPublishedNotes,
} from "@/lib/admin/queries"
import { getInitials } from "@/components/admin/contributors/utils"
import { APP_NAME } from "@/constants/app.constants"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  Calendar04Icon,
  CheckmarkBadge01Icon,
  NotebookIcon,
} from "@hugeicons/core-free-icons"
import { slugToTitle } from "@/utils/slug"
import { formatDate } from "@/utils/format-date"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

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
    return { title: `Contributor Not Found | ${APP_NAME}` }
  }

  return {
    title: `${contributor.displayName} (@${contributor.username}) | Contributors | ${APP_NAME}`,
    description: `${contributor.displayName} has shared ${contributor.publishedNoteCount} note${
      contributor.publishedNoteCount === 1 ? "" : "s"
    } on ${APP_NAME}.`,
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
    <main className="pt-4 pb-6">
      <Link
        href="/contributors"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <HugeiconsIcon
          icon={ArrowLeft02Icon}
          size={22}
          color="currentColor"
          strokeWidth={1.5}
        />{" "}
        All Contributors
      </Link>

      <section className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="size-18 border">
              <AvatarImage
                src={contributor.avatarUrl ?? undefined}
                alt={`${contributor.displayName}'s avatar`}
              />
              <AvatarFallback className="text-lg">
                {getInitials(contributor.displayName)}
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
          <div className="space-y-1">
            <h3 className="text-xl font-medium text-foreground">
              {contributor.displayName}
            </h3>
            <p className="text-muted-foreground">@{contributor.username}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={NotebookIcon}
              size={24}
              color="currentColor"
              strokeWidth={2}
              className="size-4 text-muted-foreground"
            />
            <p className="font-medium text-muted-foreground">
              {contributor.publishedNoteCount.toLocaleString()}{" "}
              {contributor.publishedNoteCount === 1
                ? "Note Shared"
                : "Notes Shared"}
            </p>
          </div>
          <Separator orientation="vertical" />
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Calendar04Icon}
              size={24}
              color="currentColor"
              strokeWidth={2}
              className="size-4 text-muted-foreground"
            />

            <p className="text-muted-foreground">
              Member since{" "}
              {formatDate(contributor.joinedAt, {
                dateStyle: "full",
              })}
            </p>
          </div>
        </div>

        {contributor.bio && (
          <div className="space-y-1">
            <h4 className="text-lg font-medium text-foreground">Bio:</h4>
            <p className="mt-1 max-w-md text-base text-muted-foreground">
              {contributor.bio}
            </p>
          </div>
        )}

        {contributor.subjects.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-lg font-medium text-foreground">Subjects:</h4>
            <ul
              className="list-inside list-disc space-y-1 text-muted-foreground"
              aria-label="Subjects contributed"
            >
              {contributor.subjects.map((subject) => (
                <li key={subject} className="list-inside pl-2">
                  {slugToTitle(subject)}
                </li>
              ))}
            </ul>
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
