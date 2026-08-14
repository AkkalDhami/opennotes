"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function RefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <HugeiconsIcon
        icon={RefreshIcon}
        size={16}
        strokeWidth={2}
        className={isPending ? "size-4 animate-spin" : "size-4"}
        aria-hidden="true"
      />
      Refresh
    </Button>
  )
}
