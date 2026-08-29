"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  ComputerIcon,
  Logout01Icon,
  SecurityCheckIcon,
  ShieldEnergyIcon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { SessionCard } from "@/components/settings/sessions/session-card"
import { LogoutIntent, PublicSessionType } from "@/types/session"
import { LogoutAlertDialog } from "./logout-alert-dialog"
import { SecurityNotice } from "./security-notice"
import { SessionStatCard } from "./session-stat"
import { AboutSessions } from "./about-session"
import {
  aboutSessionsItems,
  MAX_SESSIONS_DAYS,
  securityTips,
} from "@/constants/auth.constants"
import { SecurityTips } from "./security-tips"
import { SubHeading } from "@/components/ui/sub-heading"

export function SessionListClient({
  sessions,
  maxSessions,
}: {
  sessions: PublicSessionType[]
  maxSessions: number
}) {
  const [intent, setIntent] = React.useState<LogoutIntent | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [notice, setNotice] = React.useState<string | null>(null)

  const hasOtherSessions = sessions.some((s) => !s.isCurrent)

  function requestLogout(next: LogoutIntent) {
    setIntent(next)
    setDialogOpen(true)
    setNotice(null)
  }

  function handleSuccess(resolved: LogoutIntent) {
    switch (resolved.kind) {
      case "session":
        setNotice("Device logged out successfully.")
        break
      case "current":
      case "all":
        break
      case "others":
        setNotice("Other devices were logged out.")
        break
    }
  }

  const activeCount = sessions.length
  const uniquePlatforms = Array.from(new Set(sessions.map((s) => s.device)))

  return (
    <div className="flex flex-col gap-5">
      {notice && (
        <div
          role="status"
          className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground"
        >
          {notice}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SessionStatCard
          icon={
            <HugeiconsIcon
              icon={ComputerIcon}
              size={20}
              className="text-blue-600"
            />
          }
          iconWrapperClassName="bg-blue-500/10"
          value={`${activeCount} / ${maxSessions}`}
          label="Active Sessions"
          description={`You can use up to ${maxSessions} devices`}
        />
        <SessionStatCard
          icon={
            <HugeiconsIcon
              icon={Calendar03Icon}
              size={20}
              className="text-emerald-600"
            />
          }
          iconWrapperClassName="bg-emerald-500/10"
          value={`${MAX_SESSIONS_DAYS} days`}
          label="Session Duration"
          description={`Each session expires after ${MAX_SESSIONS_DAYS} days`}
        />
        <SessionStatCard
          icon={
            <HugeiconsIcon
              icon={SmartPhone01Icon}
              size={20}
              className="text-orange-600"
            />
          }
          iconWrapperClassName="bg-orange-500/10"
          value={`${activeCount}`}
          label="Devices"
          description={`Across ${uniquePlatforms.join(", ")}`}
        />
        <SessionStatCard
          icon={
            <HugeiconsIcon
              icon={ShieldEnergyIcon}
              size={20}
              className="text-purple-600"
            />
          }
          iconWrapperClassName="bg-purple-500/10"
          value="Secure"
          label=""
          description="All sessions are encrypted and secure"
        />
      </div>
      <SecurityNotice onLogoutAll={() => requestLogout({ kind: "all" })} />
      <div className="flex flex-col gap-4 rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={SecurityCheckIcon}
            size={18}
            strokeWidth={2}
            className="text-primary"
          />
          <SubHeading as="h3">
            Active sessions ({activeCount} of {maxSessions})
          </SubHeading>
        </div>
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.sessionId}
              session={session}
              onRequestLogout={requestLogout}
            />
          ))}
        </div>
      </div>

      <AboutSessions items={aboutSessionsItems} />
      <div className="flex flex-wrap gap-3">
        {hasOtherSessions && (
          <Button
            type="button"
            variant="outline"
            onClick={() => requestLogout({ kind: "others" })}
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={2} />
            Log out other devices
          </Button>
        )}

        <Button
          type="button"
          variant="destructive"
          onClick={() => requestLogout({ kind: "all" })}
        >
          <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={2} />
          Log out all devices
        </Button>
      </div>
      <LogoutAlertDialog
        intent={intent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />

      <SecurityTips tips={securityTips} />
    </div>
  )
}
