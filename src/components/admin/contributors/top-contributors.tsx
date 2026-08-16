import { Heading } from "@/components/ui/heading"
import { cn } from "@/lib/utils"
import { SubHeading } from "@/components/ui/sub-heading"
import Link from "next/link"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ContributorRanking } from "@/lib/contributors/contributors-ranking"
import { TopContributorCard } from "./top-contributor-card"
import { Route } from "next";

export function TopContributors({
  contributors,
  className,
  home = false,
  admin = false,
}: {
  contributors: ContributorRanking[]
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
            {!(home || admin)
              ? "Top Contributors"
              : "Meet Our Top Contributors"}
          </Heading>
          <SubHeading>
            Celebrating the members who help make learning more accessible
            through shared knowledge.
          </SubHeading>
        </div>

        {home && (
          <Link
            href={"/contributors" as Route}
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
        {contributors.map((c) => (
          <TopContributorCard key={c.userId} contributor={c} admin={admin} />
        ))}
      </div>
    </section>
  )
}
