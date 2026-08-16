"use client"

import { useState } from "react"
import { format } from "date-fns"

import {
  ContributionGraphCalendar,
  ContributionGraphBlock,
  ContributionGraphFooter,
  ContributionGraphTotalCount,
  ContributionGraphLegend,
  Activity,
  ContributionGraph,
} from "@/components/ui/contribution-graph"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Spinner } from "@/components/ui/spinner"
import { SubHeading } from "../ui/sub-heading"
import { cn } from "@/lib/utils"

// const YEARS = [
//   { label: "2026", value: "2026" },
//   { label: "2025", value: "2025" },
//   { label: "2024", value: "2024" },
// ]

interface NoteContributionGraphProps {
  initialData: Activity[]
  className?: string
}

export function NoteContributionGraph({
  initialData,
  className,
}: NoteContributionGraphProps) {
  const [year] = useState(initialData[0]?.date.slice(0, 4) ?? "2026")

  /*
   * For now, initialData represents the selected year's data.
   *
   * If you later fetch different years from the server,
   * replace this with state such as:
   *
   * const [data, setData] = useState(initialData)
   */

  const data = initialData.filter((activity) => activity.date.startsWith(year))

  return (
    <div className={cn("space-y-3 rounded-lg border bg-card p-4", className)}>
      <SubHeading as="h3">Contribution Graph</SubHeading>

      <div className="w-full overflow-hidden">
        <TooltipProvider>
          <ContributionGraph
            data={data}
            blockSize={12}
            blockMargin={4}
            className="w-full"
          >
            <ContributionGraphCalendar className="no-scrollbar px-2">
              {({ activity, dayIndex, weekIndex }) => (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <g>
                        <ContributionGraphBlock
                          activity={activity}
                          dayIndex={dayIndex}
                          weekIndex={weekIndex}
                        />
                      </g>
                    }
                  />

                  <TooltipContent className="rounded-md">
                    <p className="text-sm font-medium">
                      {activity.count}{" "}
                      {activity.count === 1 ? "contribution" : "contributions"}
                    </p>

                    <p className="text-sm">
                      {format(new Date(activity.date), "MMM d, yyyy")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </ContributionGraphCalendar>

            <ContributionGraphFooter className="mt-3 text-sm">
              <ContributionGraphTotalCount />

              <ContributionGraphLegend />
            </ContributionGraphFooter>
          </ContributionGraph>
        </TooltipProvider>
      </div>
    </div>
  )
}

export function GitHubContributionFallback() {
  return (
    <div className="flex h-40.5 w-full items-center justify-center">
      <Spinner />
    </div>
  )
}
