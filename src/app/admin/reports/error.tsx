"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function AdminReportsError({
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
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm font-medium text-foreground">
        Something went wrong while loading this section.
      </p>
      <p className="text-sm text-muted-foreground">
        Try again, or come back in a moment.
      </p>
      <Button variant="outline" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
