"use client"

import { useRouter } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SectionError({ title }: { title?: string }) {
  const router = useRouter()

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 text-center">
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
