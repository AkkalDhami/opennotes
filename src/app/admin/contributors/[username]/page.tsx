import { Metadata } from "next"
import { notFound } from "next/navigation"

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
  ArrowUpRight01Icon,
  Calendar04Icon,
  ChampionIcon,
  CheckmarkBadge01Icon,
  NotebookIcon,
} from "@hugeicons/core-free-icons"
import { slugToTitle } from "@/utils/slug"
import { formatDate } from "@/utils/format-date"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { CopyButton } from "@/components/shared/copy-button"
import { Heading } from "@/components/ui/heading"
import Link from "next/link"

import {
  getContributorRecentActivity,
  getContributorStats,
} from "@/lib/admin/contributors"
import { getContributionActivity } from "@/lib/contributions/get-contribution-activity"
import { ContributorOverview } from "@/components/admin/contributors/contributor-overview"
import { getContributorRank } from "@/lib/contributors/get-contributor-rank"
import { RankMedal } from "@/components/shared/rank-medal"
import { buttonVariants } from "@/components/ui/button"
import { DashboardContainer } from "@/components/ui/dashboard-container"

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
    title: `${contributor.displayName} (@${contributor.username}) | Admin | Contributors | ${APP_NAME}`,
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

  const [stats, contributionActivity, recentActivity, contributorRank] =
    await Promise.all([
      getContributorStats(contributor.id),
      getContributionActivity({
        contributorId: contributor.id,
      }),
      getContributorRecentActivity(contributor.id),
      getContributorRank(contributor.id),
    ])

  return (
    <DashboardContainer>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading>Contributor Profile</Heading>

        <Link
          href={`/contributors/${contributor.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({
              variant: "outline",
            })
          )}
        >
          View Public Profile
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={24}
            color="currentColor"
            strokeWidth={2}
          />
        </Link>
      </div>

      <section className="space-y-4">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
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
              <div className="relative my-0 flex items-center space-x-2">
                <h3 className="text-xl font-medium text-foreground">
                  {contributor.displayName}
                </h3>
                <CopyButton
                  text={contributor.displayName}
                  className="relative"
                />
              </div>
              <div className="relative my-0 flex items-center space-x-2">
                <p className="text-muted-foreground">@{contributor.username}</p>
                <CopyButton text={contributor.username} className="relative" />
              </div>
            </div>
          </div>

          {contributorRank?.rank && (
            <RankMedal
              size={140}
              rank={contributorRank?.rank}
              showLabel={false}
              className="to absolute right-0"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-muted-foreground">Id:</h4>
            <div className="relative my-0 flex items-center space-x-2">
              <p className="text-foreground">{contributor.id}</p>
              <CopyButton text={contributor.id} className="relative" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <h4 className="font-medium text-muted-foreground">Email:</h4>
            <div className="relative my-0 flex items-center space-x-2">
              <p className="">{contributor.email}</p>
              <CopyButton text={contributor.email} className="relative" />
            </div>
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

            <p className="hidden text-muted-foreground sm:block">
              Member since{" "}
              {formatDate(contributor.joinedAt, {
                dateStyle: "full",
                timeStyle: "medium",
              })}
            </p>
            <p className="text-muted-foreground sm:hidden">
              Member since{" "}
              {formatDate(contributor.joinedAt, {
                dateStyle: "medium",
              })}
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
      </section>

      <ContributorOverview
        stats={stats}
        contributionActivity={contributionActivity}
        recentActivity={recentActivity}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Published Notes
        </h2>
        <div>
          <ContributorNotes
            notes={notes}
            page={page}
            totalPages={totalPages}
            username={contributor.username}
          />
        </div>
      </section>
    </DashboardContainer>
  )
}
