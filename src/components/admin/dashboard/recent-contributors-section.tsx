import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  BookOpen01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

import { DashboardSectionError } from "./dashboard-section-error"
import {
  getRecentContributors,
  RecentContributor,
} from "@/lib/admin/dashboard/get-recent-contributors"
import { VerifiedUserAvatar } from "@/components/shared/verified-user-avatar"

export async function RecentContributorsSection() {
  let contributors: RecentContributor[]

  try {
    contributors = await getRecentContributors(6)
  } catch (error) {
    console.error("[admin-dashboard] failed to load recent contributors", error)
    return <DashboardSectionError title="Couldn't load recent contributors." />
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h3 className="text-lg font-medium">Recent Contributors</h3>
      {contributors.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No contributors yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {contributors.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3">
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
                      {c.noteCount} note
                      {c.noteCount === 1 ? "" : "s"}
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
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          nativeButton={false}
          render={
            <Link href="/admin/contributors">
              View all
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={14}
                color="currentColor"
                strokeWidth={2}
                className="size-3.5"
              />
            </Link>
          }
        />
      </div>
    </div>
  )
}
