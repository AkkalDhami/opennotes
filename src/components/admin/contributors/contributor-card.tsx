"use client"

import Link from "next/link"
import { motion } from "motion/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "./utils"
import { Rank, RankMedal } from "@/components/shared/rank-medal"
import { cn } from "@/lib/utils"

type PodiumRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface ContributorCardProps {
  id: string
  displayName: string
  username: string
  avatarUrl: string | null
  publishedNoteCount: number
  rank?: Rank
  admin?: boolean
}

const PODIUM_WASH: Record<PodiumRank, string> = {
  1: "from-amber-100 dark:from-amber-500/10",
  2: "from-slate-100 dark:from-slate-500/10",
  3: "from-orange-100 dark:from-orange-500/10",
  4: "from-blue-100 dark:from-blue-500/10",
  5: "from-blue-100 dark:from-blue-500/10",
  6: "from-blue-100 dark:from-blue-500/10",
  7: "from-blue-100 dark:from-blue-500/10",
  8: "from-blue-100 dark:from-blue-500/10",
  9: "from-blue-100 dark:from-blue-500/10",
  10: "from-blue-100 dark:from-blue-500/10",
}

const PODIUM_RING: Record<PodiumRank, string> = {
  1: "ring-amber-500/70",
  2: "ring-stone-500/70",
  3: "ring-orange-500/70",
  4: "ring-blue-500/70",
  5: "ring-blue-500/70",
  6: "ring-blue-500/70",
  7: "ring-blue-500/70",
  8: "ring-blue-500/70",
  9: "ring-blue-500/70",
  10: "ring-blue-500/70",
}

const TEXT_COLOR: Record<PodiumRank, string> = {
  1: "text-amber-600",
  2: "text-slate-500",
  3: "text-orange-700",
  4: "text-blue-600",
  5: "text-blue-600",
  6: "text-blue-600",
  7: "text-blue-600",
  8: "text-blue-600",
  9: "text-blue-600",
  10: "text-blue-600",
}

function isPodiumRank(rank?: Rank): rank is PodiumRank {
  return rank === 1 || rank === 2 || rank === 3
}

export function ContributorCard({
  displayName,
  username,
  avatarUrl,
  publishedNoteCount,
  rank,
  admin = false,
}: ContributorCardProps) {
  const podiumRank = isPodiumRank(rank) ? rank : undefined
  const isFeatured = Boolean(podiumRank)
  const isRanked = Boolean(rank) && !isFeatured

  return (
    <Link
      href={
        admin
          ? (`/admin/contributors/${username}` as Route)
          : `/contributors/${username}`
      }
      className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="h-full"
      >
        <div className="relative h-full overflow-hidden rounded-lg bg-card p-5 transition-colors group-hover:bg-brand/10">
          {podiumRank && (
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b to-transparent",
                PODIUM_WASH[podiumRank]
              )}
            />
          )}

          {isRanked && (
            <div className="absolute top-3 right-5 z-10">
              <RankMedal rank={rank!} size={50} showLabel={false} />
            </div>
          )}

          {podiumRank && (
            <RankMedal
              rank={podiumRank}
              size={80}
              showLabel={false}
              className="absolute right-2 bottom-2 opacity-80"
            />
          )}
          {podiumRank && (
            <span
              className={cn(
                "absolute top-3 right-4 z-10 font-heading text-sm font-medium",
                TEXT_COLOR[podiumRank as 1 | 2 | 3]
              )}
            >
              {APP_NAME} Contributor
            </span>
          )}
          <div
            className={cn(
              "relative z-10 mt-0 flex flex-col",
              isFeatured ? "gap-3" : "gap-2"
            )}
          >
            <div className="relative space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar
                    className={cn(
                      isFeatured ? "size-28" : "size-24",
                      podiumRank &&
                        cn(
                          "ring-2 ring-offset-2 ring-offset-background",
                          PODIUM_RING[podiumRank]
                        )
                    )}
                  >
                    <AvatarImage
                      src={avatarUrl ?? undefined}
                      alt={`${displayName}'s avatar`}
                    />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>

                  <span
                    className={cn(
                      "absolute right-1 bottom-0.5 flex items-center justify-center rounded-full bg-background",
                      isFeatured ? "size-7 p-0.5" : "size-6 p-0.5"
                    )}
                  >
                    <BadgeCheckFilled className="text-blue-600" />
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xl font-medium text-foreground">
                    {displayName}
                  </p>
                  <p className="text-lg text-muted-foreground">@{username}</p>
                </div>
              </div>

              <p className="text-base text-foreground">
                <span className="text-lg font-semibold text-brand">
                  {publishedNoteCount.toLocaleString()}
                </span>{" "}
                {publishedNoteCount === 1 ? "Note Shared" : "Notes Shared"}
              </p>

              {/* {topSubject && (
                <span className="text-sm text-muted-foreground">
                  {slugToTitle(topSubject)}
                </span>
              )} */}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

import type { SVGProps } from "react"
import { APP_NAME } from "@/constants/app.constants"
import { Route } from "next"

export function BadgeCheckFilled(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 12 12"
    >
      <path
        fill="currentColor"
        d="m6.933.332l.113.101l.89.89l1.26.001a1.48 1.48 0 0 1 1.453 1.198l.02.138l.007.143l-.002 1.259l.893.892a1.48 1.48 0 0 1 .19 1.86l-.089.12l-.101.112l-.893.891l.001 1.258c0 .659-.432 1.224-1.056 1.415l-.136.035l-.142.023l-.144.007h-1.26l-.891.892a1.48 1.48 0 0 1-1.86.19l-.12-.089l-.112-.101l-.892-.893l-1.258.001A1.48 1.48 0 0 1 1.35 9.48l-.02-.139l-.006-.142V7.936l-.89-.89a1.48 1.48 0 0 1-.19-1.86l.088-.12l.101-.112l.89-.891l.001-1.26c0-.72.516-1.32 1.198-1.452l.139-.02l.142-.007h1.26l.891-.89a1.48 1.48 0 0 1 1.98-.102zm1.212 3.657l-.085.071L5.5 6.62L4.44 5.56a.63.63 0 0 0-.88 0a.63.63 0 0 0-.071.795l.071.085l1.5 1.5a.625.625 0 0 0 .804.065l.076-.065l3-3a.61.61 0 0 0 0-.88a.63.63 0 0 0-.795-.071"
      />
    </svg>
  )
}
