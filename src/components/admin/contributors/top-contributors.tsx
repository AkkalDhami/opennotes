import { Heading } from "@/components/ui/heading"
import { cn } from "@/lib/utils"
import { SubHeading } from "@/components/ui/sub-heading"
import Link from "next/link"
import { ArrowRight02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ContributorRanking } from "@/lib/contributors/contributors-ranking"
import { TopContributorCard } from "./top-contributor-card"
import { Route } from "next"
import { Highlight } from "@/components/ui/highlight"
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal"
import { Tilt } from "@/components/ui/tilt"

const MAX_TOP_CONTRIBUTORS = 5
const CONTRIBUTORS_GRID_CLASS =
  "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"

function OpenSpotCard() {
  return (
    <Tilt isRevese>
      <Link
        href="/contribution"
        className="group block h-full rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      >
        <div className="flex h-full min-h-44 flex-col justify-center rounded-lg border border-dashed border-border bg-background p-5 text-center transition-colors group-hover:border-primary group-hover:bg-muted/30">
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <HugeiconsIcon
              icon={PlusSignIcon}
              size={24}
              color="currentColor"
              strokeWidth={2}
              className="text-muted-foreground"
            />

            <h3 className="text-xl font-medium text-foreground">
              Your name could be here
            </h3>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Share a note you’re proud of, earn contribution points, and claim
              a place on the leaderboard.
            </p>
          </div>
        </div>
      </Link>
    </Tilt>
  )
}

export function TopContributors({
  contributors,
  className,
  home = false,
  admin = false,
  reveal = false,
  showOpenSpot = false,
}: {
  contributors: ContributorRanking[]
  className?: string
  home?: boolean
  admin?: boolean
  reveal?: boolean
  showOpenSpot?: boolean
}) {
  if (contributors.length === 0) return null

  const visibleContributors = contributors.slice(
    0,
    showOpenSpot ? 4 : MAX_TOP_CONTRIBUTORS
  )

  const header = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Heading id="top-contributors-heading">
          Top{" "}
          <Highlight animate={false} color="var(--primary)" variant="outline">
            Contributors
          </Highlight>
        </Heading>
        <SubHeading>
          Celebrating the members who help make learning more accessible through
          shared knowledge.
        </SubHeading>
      </div>

      {home && (
        <Link
          href={"/contributors" as Route}
          className="group inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
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
  )

  const contributorItems = visibleContributors.map((contributor) => {
    const card = <TopContributorCard contributor={contributor} admin={admin} />

    return reveal ? (
      <StaggerItem key={contributor.userId} className="h-full">
        {card}
      </StaggerItem>
    ) : (
      <div key={contributor.userId} className="h-full">
        {card}
      </div>
    )
  })

  const openSpotItem = showOpenSpot ? (
    reveal ? (
      <StaggerItem className="h-full">
        <OpenSpotCard />
      </StaggerItem>
    ) : (
      <div className="h-full">
        <OpenSpotCard />
      </div>
    )
  ) : null

  return (
    <section
      aria-labelledby="top-contributors-heading"
      className={cn(className)}
    >
      {reveal ? <Reveal>{header}</Reveal> : header}
      {reveal ? (
        <StaggerGroup
          className={
            "mt-6 columns-1 gap-4 sm:columns-1 md:columns-2 lg:columns-3"
          }
        >
          {contributorItems}
          {openSpotItem}
        </StaggerGroup>
      ) : (
        <div className={CONTRIBUTORS_GRID_CLASS}>
          {contributorItems}
          {openSpotItem}
        </div>
      )}
    </section>
  )
}
