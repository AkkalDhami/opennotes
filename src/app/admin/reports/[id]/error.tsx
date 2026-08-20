"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function AdminReportDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[admin-reports] detail route error", error)
  }, [error])

  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-sm font-medium text-foreground">
        Something went wrong while loading this report.
      </p>
      <Button variant="outline" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
