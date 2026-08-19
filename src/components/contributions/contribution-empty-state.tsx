import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { File01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

interface ContributionEmptyStateProps {
  variant: "no-contributions" | "no-results"
}

export function ContributionEmptyState({
  variant,
}: ContributionEmptyStateProps) {
  const isNoResults = variant === "no-results"

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon
          icon={isNoResults ? Search01Icon : File01Icon}
          size={20}
          color="currentColor"
          strokeWidth={2}
          className="size-5 text-muted-foreground"
        />
      </div>

      <div className="space-y-1">
        <p className="font-medium text-foreground">
          {isNoResults
            ? "No contributions found."
            : "You haven't shared any notes yet."}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isNoResults
            ? "Try changing your search or filters."
            : "Share your notes with students and help build a better learning community."}
        </p>
      </div>

      {!isNoResults ? (
        <Button
          variant={"default"}
          nativeButton={false}
          render={<Link href="/contribution">Share a Note</Link>}
          className="mt-2"
        ></Button>
      ) : null}
    </div>
  )
}
