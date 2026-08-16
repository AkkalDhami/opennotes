"use client"

import { useTransition } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { approveContribution } from "@/lib/admin/contributions"

export function ApproveContributionButton({
  noteId,
  label = "Approve",
  size = "sm",
}: {
  noteId: string
  label?: string
  size?: "sm" | "default"
}) {
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    startTransition(async () => {
      const result = await approveContribution(noteId)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button
      size={size}
      variant="outline"
      className="text-green-600 hover:text-green-700 dark:text-green-500"
      onClick={handleApprove}
      disabled={isPending}
    >
      <HugeiconsIcon
        icon={CheckmarkCircle02Icon}
        size={16}
        strokeWidth={2}
        className="size-4"
        aria-hidden="true"
      />
      {isPending ? "Approving..." : label}
    </Button>
  )
}
