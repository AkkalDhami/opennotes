"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

interface AdminUsersErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: AdminUsersErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center gap-3 p-16 text-center">
      <p className="font-medium text-foreground">Something went wrong.</p>
      <p className="text-sm text-muted-foreground">
        We couldn&apos;t load the users right now.
      </p>
      <Button onClick={reset} size="sm">
        Try again
      </Button>
    </div>
  )
}
