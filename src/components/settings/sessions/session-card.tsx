import { Button } from "@/components/ui/button"
import { DeviceBadge } from "@/components/settings/sessions/device-badge"
import { LogoutIntent, PublicSessionType } from "@/types/session"
import { formatDate } from "@/utils/format-date"
import { Calendar04Icon, Clock02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function SessionCard({
  session,
  onRequestLogout,
}: {
  session: PublicSessionType
  onRequestLogout: (intent: LogoutIntent) => void
}) {
  return (
    <div
      className={
        "flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between " +
        (session.isCurrent ? "bg-secondary/50" : "bg-muted/50")
      }
    >
      <div className="flex items-start gap-3">
        <DeviceBadge deviceType={session.deviceType} />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {session.device}
            </span>
            {session.isCurrent && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                Current session
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {session.deviceDetail}
          </span>
          {session.location && (
            <span className="text-sm text-muted-foreground">
              {session.location}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-muted-foreground">
          <HugeiconsIcon
            icon={Calendar04Icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="size-3.5"
          />
          <span className="text-sm">
            Active since{" "}
            {formatDate(session?.createdAt, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <HugeiconsIcon
            icon={Clock02Icon}
            size={18}
            color="currentColor"
            strokeWidth={2}
            className="size-3.5"
          />
          <span className="text-sm">
            Expires at{"  "}
            {formatDate(session?.expiresAt, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>
      {!session.isCurrent && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start sm:self-center"
          onClick={() =>
            onRequestLogout({
              kind: "session",
              sessionId: session.sessionId,
              deviceLabel: session.device,
            })
          }
        >
          Log out
        </Button>
      )}
    </div>
  )
}
