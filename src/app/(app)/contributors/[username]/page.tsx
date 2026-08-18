import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ContributorNotes } from "@/components/admin/contributors/contributor-notes"
import {
  getContributorByUsername,
  getContributorPublishedNotes,
} from "@/lib/admin/queries"
import { getInitials } from "@/utils/get-initials"
import { APP_NAME } from "@/constants/app.constants"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  Calendar04Icon,
  ChampionIcon,
  CheckmarkBadge01Icon,
  Download01Icon,
  NotebookIcon,
} from "@hugeicons/core-free-icons"
import { slugToTitle } from "@/utils/slug"
import { formatDate } from "@/utils/format-date"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { buttonVariants } from "@/components/ui/button"
import { SubHeading } from "@/components/ui/sub-heading"
import { getContributionActivity } from "@/lib/contributions/get-contribution-activity"
import { NoteContributionGraph } from "@/components/contributions/contribution-graph-content"
import { RankMedal } from "@/components/shared/rank-medal"
import { getContributorRank } from "@/lib/contributors/get-contributor-rank"
import { absoluteUrl } from "@/lib/seo"

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
    return {
      title: "Contributor Not Found",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${contributor.displayName}(@${contributor.username}) — Educational Notes Contributor`

  const description =
    contributor.bio ||
    `${contributor.displayName} has shared educational notes and study materials with the ${APP_NAME} learning community.`

  return {
    title,
    description,

    alternates: {
      canonical: `/contributors/${contributor.username}`,
    },

    openGraph: {
      type: "profile",
      title,
      description,
      url: absoluteUrl(`/contributors/${contributor.username}`),
      images: contributor.avatarUrl
        ? [contributor.avatarUrl]
        : ["/og-image.png"],
    },
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

  const [{ notes, totalPages }, contributionActivity, contributorRank] =
    await Promise.all([
      getContributorPublishedNotes(contributor.id, page),
      getContributionActivity({
        contributorId: contributor.id,
      }),
      getContributorRank(contributor.id),
    ])

  return (
    <main className="space-y-6">
      <Link
        href="/contributors"
        className={cn(
          buttonVariants({
            variant: "secondary",
          })
        )}
      >
        <HugeiconsIcon
          icon={ArrowLeft02Icon}
          size={22}
          color="currentColor"
          strokeWidth={1.5}
        />{" "}
        All Contributors
      </Link>

      <div className="flex flex-wrap-reverse justify-between gap-6">
        <div className="space-y-4">
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
                  : "Published Notes"}
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
                  dateStyle: "medium",
                })}
              </p>
            </div>
            <Separator orientation="vertical" />
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Download01Icon}
                size={24}
                color="currentColor"
                strokeWidth={2}
                className="size-4 text-muted-foreground"
              />

              <p className="text-muted-foreground">
                Total downloads:{" "}
                <span className="font-medium text-foreground">
                  {contributorRank?.downloads
                    ? contributorRank.downloads.toLocaleString()
                    : "N/A"}
                </span>
              </p>
            </div>
            <Separator orientation="vertical" />
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={ChampionIcon}
                size={24}
                color="currentColor"
                strokeWidth={2}
                className="size-4 text-muted-foreground"
              />

              <p className="text-muted-foreground">
                Total contribution points:{" "}
                <span className="font-medium text-foreground">
                  {contributorRank?.score
                    ? contributorRank.score.toLocaleString()
                    : "N/A"}
                </span>
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
        </div>
        {contributorRank?.rank && (
          <RankMedal rank={contributorRank?.rank} showLabel={false} />
        )}
      </div>

      <NoteContributionGraph
        initialData={contributionActivity.days}
        className="max-w-225"
      />

      <section className="space-y-4">
        <SubHeading as="h3">Published Notes:</SubHeading>
        <div className="mt-4">
          <ContributorNotes
            notes={notes}
            page={page}
            totalPages={totalPages}
            username={contributor.username}
            from="contributor"
          />
        </div>
      </section>
    </main>
  )
}
