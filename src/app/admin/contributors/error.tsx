"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ErrorContainer } from "@/components/ui/error-container"

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[admin-reports] route error", error)
  }, [error])

  return (
    <ErrorContainer>
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <HugeiconsIcon
          icon={Alert02Icon}
          size={20}
          strokeWidth={2}
          className="size-5"
        />
      </div>
      <p className="text-lg font-medium text-foreground">
        Something went wrong while loading this section.
      </p>
      <p className="text-base text-muted-foreground">
        Try again, or come back in a moment.
      </p>
      <Button variant="outline" onClick={() => reset()}>
        Try again
      </Button>
    </ErrorContainer>
  )
}
