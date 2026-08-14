import { Search01Icon, UserGroupIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"

export function ContributorsEmptyState({
  variant,
}: {
  variant: "no-contributors" | "no-results"
}) {
  if (variant === "no-results") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <HugeiconsIcon
          icon={Search01Icon}
          size={21}
          strokeWidth={2}
          className="size-8 text-muted-foreground"
          aria-hidden="true"
        />

        <p className="font-medium text-foreground">No contributors found</p>
        <p className="text-sm text-muted-foreground">
          Try a different name or username.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <HugeiconsIcon
        icon={UserGroupIcon}
        size={21}
        strokeWidth={2}
        className="size-8 text-muted-foreground"
        aria-hidden="true"
      />
      <p className="font-medium text-foreground">No contributors yet</p>
      <p className="text-sm text-muted-foreground">
        Be the first to share your notes with the community.
      </p>
      <Button
        render={<Link href="/contribution">Share Your Notes</Link>}
        className="mt-2"
      ></Button>
    </div>
  )
}
