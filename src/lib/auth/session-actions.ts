"use server"

import { revalidatePath } from "next/cache"
import {
  getSession,
  revokeSession,
  revokeOtherSessions,
  revokeAllSessions,
} from "@/features/auth/auth.service"
import { SessionActionResult } from "@/types/session"
import { requireAuthenticatedSession } from "./current-session"
import { removeAuthCookie } from "@/features/auth/auth.cookie"

const SETTINGS_SECURITY_PATH = "/settings/security"

const GENERIC_ERROR: SessionActionResult = {
  success: false,
  message: "We couldn't log out this device. Please try again.",
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
