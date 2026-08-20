"use client"

import { useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export default function AdminNotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to server-side monitoring; never render error.message/stack to the admin.
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <HugeiconsIcon
          icon={Alert02Icon}
          size={20}
          strokeWidth={2}
          className="size-5"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Something went wrong
        </p>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load the notes.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
