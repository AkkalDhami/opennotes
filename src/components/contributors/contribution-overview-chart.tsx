"use client"

import {
  EChartsAreaChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-area-chart"
import type { ContributorChartMonth } from "@/lib/contributors/get-contributor-chart-data"

const config = {
  contributionPoints: {
    label: "Contribution points",
    colors: { light: ["#10b981"], dark: ["#34d399"] },
  },
  publishedNotes: {
    label: "Published notes",
    colors: { light: ["#3b82f6"], dark: ["#60a5fa"] },
  },
} satisfies ChartConfig

export function ContributionOverviewChart({
  data,
}: {
  data: ContributorChartMonth[]
}) {
  const totalPoints = data.reduce(
    (sum, month) => sum + month.contributionPoints,
    0
  )
  const totalNotes = data.reduce((sum, month) => sum + month.publishedNotes, 0)

  return (
    <section className="min-w-0 rounded-xl border bg-card p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Contribution overview</h2>
          <p className="text-sm text-muted-foreground">
            Published notes and points earned this year
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="space-y-1">
            <span className="block text-muted-foreground">Points</span>
            <strong>{totalPoints.toLocaleString()}</strong>
          </div>
          <div className="space-y-1">
            <span className="block text-muted-foreground">Published notes</span>
            <strong>{totalNotes.toLocaleString()}</strong>
          </div>
        </div>
      </div>
      <EChartsAreaChart
        data={data as unknown as Record<string, unknown>[]}
        config={config}
        xDataKey="month"
        className="h-64 w-full sm:h-80"
        curveType="smooth"
        enableHoverHighlight
      >
        <EChartsAreaChart.Grid />
        <EChartsAreaChart.XAxis dataKey="month" />
        <EChartsAreaChart.YAxis />
        <EChartsAreaChart.Tooltip />
        <EChartsAreaChart.Legend align="left" />
        <EChartsAreaChart.Area
          dataKey="contributionPoints"
          variant="gradient"
          strokeVariant="solid"
        />
        <EChartsAreaChart.Area
          dataKey="publishedNotes"
          variant="gradient"
          strokeVariant="solid"
        />
      </EChartsAreaChart>
      <p className="mt-4 text-xs text-muted-foreground">
        Contribution points in this chart reflect the points awarded for
        published notes.
      </p>
    </section>
  )
}
