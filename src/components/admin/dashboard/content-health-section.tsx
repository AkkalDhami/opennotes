import { DashboardSectionError } from "./dashboard-section-error"
import {
  AdminStats,
  getAdminStats,
} from "@/lib/admin/dashboard/get-admin-stats"

export async function ContentHealthSection() {
  let stats: AdminStats

  try {
    stats = await getAdminStats()
  } catch (error) {
    console.error("[admin-dashboard] failed to load content health", error)
    return <DashboardSectionError title="Couldn't load content health." />
  }

  const items = [
    { label: "Published", value: stats.publishedNotes },
    { label: "Pending", value: stats.pendingReview },
    { label: "Reports", value: stats.openReports },
    { label: "Processing Errors", value: stats.processingErrors },
  ]

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <h3 className="text-lg font-medium">Content Health</h3>
      <div className="mt-3 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {item.label}
            </p>
            <p className="text-xl font-semibold text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
