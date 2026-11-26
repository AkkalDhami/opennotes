"use client"

import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { Route } from "next"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"

import type { ContributorListItem } from "@/lib/admin/queries"
import { formatDate } from "@/utils/format-date"
import { VerifiedUserAvatar } from "@/components/shared/verified-user-avatar"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCompactNumber } from "@/utils/format"

const MotionTableRow = motion.create(TableRow)

export function ContributorsTable({
  contributors,
  startRank = 1,
}: {
  contributors: ContributorListItem[]
  startRank?: number
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <Table className="min-w-240 scroll-fade-x scrollbar-thin">
      <TableCaption className="sr-only">
        Contributors ranked by published notes, with rank, contribution points,
        notes, downloads, bookmarks, views, top subject, and join date.
      </TableCaption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead scope="col" className="w-16 py-4 text-center">
            Rank
          </TableHead>
          <TableHead scope="col" className="py-4">
            Contributor
          </TableHead>
          <TableHead scope="col" className="py-4 text-center">
            Points
          </TableHead>
          <TableHead scope="col" className="py-4 text-center">
            Notes
          </TableHead>
          <TableHead scope="col" className="py-4 text-center">
            Downloads
          </TableHead>
          <TableHead scope="col" className="py-4 text-center">
            Bookmarks
          </TableHead>
          <TableHead scope="col" className="py-4 text-center">
            Views
          </TableHead>
          <TableHead scope="col" className="hidden py-4 lg:table-cell">
            Joined
          </TableHead>
          <TableHead scope="col" className="w-12 py-4">
            <span className="sr-only">View profile</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contributors.map((contributor, index) => {
          const href = `/contributors/${contributor.username}` as Route
          const rank = startRank + index

          return (
            <MotionTableRow
              key={contributor.id}
              className="group hover:bg-transparent"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
              viewport={{ once: true, amount: 0.4, margin: "-40px" }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : Math.min(index, 5) * 0.05,
              }}
            >
              <TableCell className="w-16 text-center font-medium tabular-nums">
                #{rank}
              </TableCell>

              <TableCell className="max-w-70 py-3">
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                  <VerifiedUserAvatar
                    displayName={contributor.displayName}
                    avatarUrl={contributor.avatarUrl}
                    size="sm"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline">
                      {contributor.displayName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      @{contributor.username}
                    </span>
                  </span>
                </Link>
              </TableCell>

              <TableCell className="text-center">
                <span className="inline-flex min-w-12 justify-center font-medium text-muted-foreground tabular-nums">
                  {formatCompactNumber(contributor.score)}
                </span>
              </TableCell>

              <TableCell className="text-center font-medium text-muted-foreground tabular-nums">
                <span className="inline-flex min-w-12 justify-center font-medium text-muted-foreground tabular-nums">
                  {formatCompactNumber(contributor.publishedNoteCount)}
                </span>
              </TableCell>

              <TableCell className="min-w-14 text-center text-muted-foreground tabular-nums">
                {formatCompactNumber(contributor.downloads)}
              </TableCell>

              <TableCell className="text-center text-muted-foreground tabular-nums">
                {formatCompactNumber(contributor.bookmarks)}
              </TableCell>

              <TableCell className="text-center text-muted-foreground tabular-nums">
                {formatCompactNumber(contributor.views)}
              </TableCell>

              <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                {formatDate(contributor.joinedAt, { dateStyle: "medium" })}
              </TableCell>

              <TableCell className="text-right">
                <Link
                  href={href}
                  aria-label={`View ${contributor.displayName}'s profile`}
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Link>
              </TableCell>
            </MotionTableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
