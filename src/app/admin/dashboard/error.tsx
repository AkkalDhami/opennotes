"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[admin-dashboard] route error", error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-24 text-center">
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
