"use server"

import redis from "@/configs/redis"
import { verifyRefreshToken } from "../jwt"
import { cookies } from "next/headers"

import { SessionType } from "@/types/auth"
import { getCurrentSessionId } from "@/features/auth/auth.cookie"

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refresh_token")?.value

  if (!refreshToken) {
    return false
  }

  const decodedToken = verifyRefreshToken(refreshToken)
  if (!decodedToken) {
    return false
  }

  cookieStore.delete("access_token")
  cookieStore.delete("refresh_token")
  cookieStore.delete("sid")

  return true
}

export async function logoutUser(userId: string) {
  const sessionId = await getCurrentSessionId()

  const sessionKey = `session:${sessionId}`
  const userSessionsKey = `user_sessions:${userId}`

  const session = await redis.get<SessionType>(sessionKey)

  if (!session) {
    return {
      success: true,
    }
  }

  if (session.userId !== userId) {
    return {
      success: false,
      message: "Unauthorized",
    }
  }

  await Promise.all([
    redis.del(sessionKey),
    redis.zrem(userSessionsKey, sessionId),
  ])

  await removeAuthCookie()
  return {
    success: true,
  }
}
