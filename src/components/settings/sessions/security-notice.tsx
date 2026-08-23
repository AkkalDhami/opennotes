import { Button } from "@/components/ui/button"
import { SecurityCheckIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface SecurityNoticeProps {
  onLogoutAll?: () => void
}

export function SecurityNotice({ onLogoutAll }: SecurityNoticeProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <HugeiconsIcon
          icon={SecurityCheckIcon}
          size={18}
          strokeWidth={2}
          className="mt-0.5 size-5 shrink-0 text-amber-600"
        />
        <p className="text-base text-amber-600">
          For your security, if you see any unfamiliar device or location, log
          out from that session immediately.
        </p>
      </div>
      <Button
        variant="destructive"
        className="shrink-0 border border-red-500/20 text-red-600 hover:bg-red-500/10 hover:text-red-600"
        onClick={onLogoutAll}
      >
        Log out all sessions
      </Button>
    </div>
  )
}
