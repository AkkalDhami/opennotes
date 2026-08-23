"use client"

import { APP_NAME } from "@/constants/app.constants"
import { SettingsSection } from "./settings-section"
import { SessionListClient } from "./sessions/session-list-client"
import { PublicSessionType } from "@/types/session"

export function SecuritySettings({
  sessions,
}: {
  sessions: PublicSessionType[]
}) {
  return (
    <div className="space-y-4">
      <SettingsSection
        title="Manage Your Sessions"
        description={`Manage the devices currently signed in to your ${APP_NAME} account.`}
      >
        <SessionListClient sessions={sessions} maxSessions={6} />
      </SettingsSection>
    </div>
  )
}
