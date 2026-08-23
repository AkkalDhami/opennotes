import { getUserSessions } from "@/features/auth/auth.service"
import { getAuthenticatedSession } from "@/lib/auth/current-session"
import { SessionListClient } from "./session-list-client"

export async function SessionList() {
  const auth = await getAuthenticatedSession()

  if (!auth) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to manage your active sessions.
      </p>
    )
  }

  const sessions = await getUserSessions(auth.userId, auth.sessionId)
  // console.log({ sessions })

  return <SessionListClient sessions={sessions} maxSessions={6} />
}
