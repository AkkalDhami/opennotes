"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS } from "@/constants/auth.constants"
import {
  ACCESS_TOKEN_TTL,
  removeAuthCookie,
  setAccessToken,
} from "@/features/auth/auth.cookie"
import {
  getSession,
  refreshAccessToken,
  revokeSession,
  revokeOtherSessions,
  revokeAllSessions,
} from "@/features/auth/auth.service"
import { JwtError, verifyAccessToken } from "@/lib/jwt"
import { SessionActionResult } from "@/types/session"
import { requireAuthenticatedSession } from "./current-session"

const SETTINGS_SECURITY_PATH = "/settings/security"
const REFRESH_LEEWAY_MS = ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS * 1000

type RefreshSessionResult =
  | { status: "anonymous" }
  | { status: "invalid" }
  | { status: "error" }
  | { status: "current"; expiresAt: number; canRefresh: boolean }

const GENERIC_ERROR: SessionActionResult = {
  success: false,
  message: "We couldn't log out this device. Please try again.",
}

export async function refreshSession(): Promise<RefreshSessionResult> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value
  const refreshToken = cookieStore.get("refresh_token")?.value

  if (!accessToken && !refreshToken) {
    return { status: "anonymous" }
  }

  try {
    let payload: ReturnType<typeof verifyAccessToken> | null = null

    if (accessToken) {
      try {
        payload = verifyAccessToken(accessToken)
      } catch {
        // An expired or invalid access token can still be replaced below.
      }
    }

    let validAccessToken = false
    let expiresAt = 0

    if (payload?.sub && payload.sid) {
      const session = await getSession(payload.sid)

      if (session?.userId === payload.sub) {
        validAccessToken = true
        expiresAt = payload.exp
          ? payload.exp * 1000
          : Date.now() + ACCESS_TOKEN_TTL * 1000
      }
    }

    if (validAccessToken && expiresAt - Date.now() > REFRESH_LEEWAY_MS) {
      return {
        status: "current",
        expiresAt,
        canRefresh: Boolean(refreshToken),
      }
    }

    if (!refreshToken) {
      if (validAccessToken) {
        return { status: "current", expiresAt, canRefresh: false }
      }

      await removeAuthCookie()
      return { status: "invalid" }
    }

    const newAccessToken = await refreshAccessToken(refreshToken)
    await setAccessToken(newAccessToken)

    const newPayload = verifyAccessToken(newAccessToken)
    const newExpiresAt = newPayload.exp
      ? newPayload.exp * 1000
      : Date.now() + ACCESS_TOKEN_TTL * 1000

    return {
      status: "current",
      expiresAt: newExpiresAt,
      canRefresh: true,
    }
  } catch (error) {
    if (error instanceof JwtError) {
      await removeAuthCookie()
      return { status: "invalid" }
    }

    console.error("Session refresh failed:", error)
    return { status: "error" }
  }
}

export async function logoutSession(
  sessionId: string
): Promise<SessionActionResult> {
  try {
    const { userId, sessionId: currentSessionId } =
      await requireAuthenticatedSession()

    const target = await getSession(sessionId)
    if (!target || target.userId !== userId) {
      return GENERIC_ERROR
    }

    const result = await revokeSession(userId, sessionId)
    if (!result.success) return GENERIC_ERROR

    if (sessionId === currentSessionId) {
      await removeAuthCookie()
    }

    revalidatePath(SETTINGS_SECURITY_PATH)
    return { success: true }
  } catch (error) {
    console.error("logoutSession failed", error)
    return GENERIC_ERROR
  }
}

export async function logoutCurrentSession(): Promise<SessionActionResult> {
  try {
    const { userId, sessionId } = await requireAuthenticatedSession()

    const result = await revokeSession(userId, sessionId)
    if (!result.success) return GENERIC_ERROR

    await removeAuthCookie()
    revalidatePath(SETTINGS_SECURITY_PATH)
    return { success: true }
  } catch (error) {
    console.error("logoutCurrentSession failed", error)
    return GENERIC_ERROR
  }
}

export async function logoutOtherSessions(): Promise<SessionActionResult> {
  try {
    const { userId, sessionId } = await requireAuthenticatedSession()

    await revokeOtherSessions(userId, sessionId)

    revalidatePath(SETTINGS_SECURITY_PATH)
    return { success: true }
  } catch (error) {
    console.error("logoutOtherSessions failed", error)
    return GENERIC_ERROR
  }
}

export async function logoutAllSessions(): Promise<SessionActionResult> {
  try {
    const { userId } = await requireAuthenticatedSession()

    await revokeAllSessions(userId)

    await removeAuthCookie()
    revalidatePath(SETTINGS_SECURITY_PATH)
    return { success: true }
  } catch (error) {
    console.error("logoutAllSessions failed", error)
    return GENERIC_ERROR
  }
}
