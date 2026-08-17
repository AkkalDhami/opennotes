import { DashboardSectionError } from "./dashboard-section-error"
import { VerifiedUserAvatar } from "@/components/shared/verified-user-avatar"
import { BookOpen01Icon, Download01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { RankMedal } from "@/components/shared/rank-medal"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  getTopContributors,
  TopContributor,
} from "@/lib/admin/dashboard/get-top-contributors"

export async function TopContributorsSection() {
  let top: TopContributor[]

  try {
    top = await getTopContributors(3)
  } catch (error) {
    console.error("[admin-dashboard] failed to load top contributors", error)
    return <DashboardSectionError title="Couldn't load top contributors." />
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Top Contributors</h3>
        <p className="text-xs text-muted-foreground">
          Ranked by published notes, then total downloads.
        </p>
      </div>
      {top.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No published contributions yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {top.map((c, i) => (
            <li key={c.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <RankMedal rank={i + 1} size={55} />
                <div className="flex min-w-0 items-center gap-3">
                  <VerifiedUserAvatar
                    displayName={c.name}
                    avatarUrl={c.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-base font-medium text-foreground">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <p>@{c.username}</p>·
                      <p className="flex items-center gap-1">
                        <HugeiconsIcon
                          icon={BookOpen01Icon}
                          size={24}
                          color="currentColor"
                          strokeWidth={2}
                          className="size-3.5"
                        />
                        {c.publishedCount} note
                        {c.publishedCount === 1 ? "" : "s"}
                      </p>
                      ·
                      <p className="flex items-center gap-1">
                        <HugeiconsIcon
                          icon={Download01Icon}
                          size={24}
                          color="currentColor"
                          strokeWidth={2}
                          className="size-3.5"
                        />
                        {c.totalDownloads} downloads
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link href={`/admin/contributors/${c.username}`}>View</Link>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
