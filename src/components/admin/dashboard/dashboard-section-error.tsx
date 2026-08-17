"use client"

import { useRouter } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/**
 * Shared fallback rendered by a dashboard section when its data fetch
 * throws. Never surface the underlying error (SQL errors, stack traces,
 * infra details) — just acknowledge the failure and offer a retry.
 */
export function DashboardSectionError({ title }: { title?: string }) {
  const router = useRouter()

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm font-medium text-foreground">
          {title ?? "Something went wrong while loading this section."}
        </p>
        <Button variant="outline" size="sm" onClick={() => router.refresh()}>
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}
