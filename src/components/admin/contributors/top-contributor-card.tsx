"use client"

import Link from "next/link"
import { motion } from "motion/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/utils/get-initials"
import { Rank, RankMedal } from "@/components/shared/rank-medal"
import { cn } from "@/lib/utils"
import { BadgeCheckFilled } from "./contributor-card"
import { Route } from "next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookOpen01Icon,
  ChampionIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import { ContributorRanking } from "@/lib/contributors/contributors-ranking"

type PodiumRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

interface ContributorCardProps {
  contributor: ContributorRanking
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

function isPodiumRank(rank?: Rank): rank is PodiumRank {
  return rank === 1 || rank === 2 || rank === 3
}

export function TopContributorCard({
  contributor: {
    username,
    name,
    score,
    avatarUrl,
    rank,
    downloads,
    publishedNotes,
  },
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
      className="group block h-full rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="h-full"
      >
        <div className="relative h-full overflow-hidden rounded-lg bg-card p-5 transition-colors group-hover:bg-brand/5">
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
              <RankMedal rank={rank!} size={40} showLabel={false} />
            </div>
          )}

          {podiumRank && (
            <RankMedal
              rank={podiumRank}
              size={70}
              showLabel={false}
              className="absolute right-2 bottom-2 opacity-80"
            />
          )}
          {podiumRank && (
            <div
              className={cn(
                "absolute top-3 right-4 z-10 flex items-center gap-2 font-heading text-sm font-medium"
              )}
            >
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={ChampionIcon} size={16} strokeWidth={2} />
                <span>{score} contribution points</span>
              </div>
            </div>
          )}
          <div className={cn("relative z-10 mt-0 flex flex-col", "gap-3")}>
            <div className="relative space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar
                    className={cn(
                      "size-16 sm:size-20",
                      podiumRank &&
                        cn(
                          "ring-2 ring-offset-2 ring-offset-background",
                          PODIUM_RING[podiumRank]
                        )
                    )}
                  >
                    <AvatarImage
                      src={avatarUrl ?? undefined}
                      alt={`${name}'s avatar`}
                    />
                    <AvatarFallback
                      className={
                        "text-2xl font-semibold text-brand sm:text-3xl"
                      }
                    >
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>

                  <span
                    className={cn(
                      "absolute right-1 bottom-0.5 flex items-center justify-center rounded-full bg-background",
                      "size-6 p-0.5"
                    )}
                  >
                    <BadgeCheckFilled className="text-blue-600" />
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xl font-medium text-foreground">{name}</p>
                  <p className="text-lg text-muted-foreground">@{username}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={BookOpen01Icon}
                    size={16}
                    strokeWidth={2}
                  />
                  <span>{publishedNotes} notes</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={Download01Icon}
                    size={16}
                    strokeWidth={2}
                  />
                  <span>{downloads} downloads</span>
                </div>
                {/* 
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={ChampionIcon}
                    size={16}
                    strokeWidth={2}
                  />
                  <span>{score} contribution points</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
