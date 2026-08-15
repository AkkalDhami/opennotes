import { ContributorListItem } from "@/lib/admin/queries"
import { ContributorCard } from "./contributor-card"
import { Heading } from "@/components/ui/heading"
import { cn } from "@/lib/utils"
import { Rank } from "@/components/shared/rank-medal"
import { SubHeading } from "@/components/ui/sub-heading"
import Link from "next/link"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function TopContributors({
  contributors,
  className,
  home = false,
  admin = false,
}: {
  contributors: ContributorListItem[]
  className?: string
  home?: boolean
  admin?: boolean
}) {
  if (contributors.length === 0) return null

  return (
    <section
      aria-labelledby="top-contributors-heading"
      className={cn(className)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Heading id="top-contributors-heading">
            {!(home || admin) ? "Top Contributors" : "Meet Our Top Contributors"}
          </Heading>
          <SubHeading>
            Recognizing members who&lsquo;ve shared the most notes with
            everyone.
          </SubHeading>
        </div>

        {(home || !admin) && (
          <Link
            href={"/contributors"}
            className="group inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            View all contributors
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={24}
              color="currentColor"
              strokeWidth={2}
              className="size-4"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {contributors.map((c, i) => (
          <ContributorCard
            key={c.id}
            id={c.id}
            displayName={c.displayName}
            username={c.username}
            avatarUrl={c.avatarUrl}
            publishedNoteCount={c.publishedNoteCount}
            rank={(i + 1) as Rank}
            admin={admin}
          />
        ))}
      </div>
    </section>
  )
}
