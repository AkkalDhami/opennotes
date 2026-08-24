"use server"

import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/jwt"
import { getSession } from "@/features/auth/auth.service"
import { CurrentSession } from "@/types/session"

export async function getAuthenticatedSession(): Promise<CurrentSession | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) return null

  let payload: { sub?: string; sid?: string }
  try {
    payload = verifyAccessToken(accessToken)
  } catch {
    return null
  }

  if (!payload?.sub || !payload?.sid) return null

  const session = await getSession(payload.sid)
  if (!session || session.userId !== payload.sub) return null

  return {
    userId: payload.sub,
    sessionId: payload.sid,
  }
}

export async function requireAuthenticatedSession(): Promise<CurrentSession> {
  const session = await getAuthenticatedSession()
  if (!session) {
    throw new Error("Not authenticated")
  }
  return session
}
