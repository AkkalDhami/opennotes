import { db } from "@/db"
import { accounts, users } from "@/db"
import { eq, and } from "drizzle-orm"
import { extractUsername } from "@/utils/extract-username"
import redis from "@/configs/redis"
import { generateHashedToken, generateUUID } from "@/helpers/token.helper"
import { signAccessToken, signRefreshToken } from "@/lib/jwt"
import { verifyRefreshToken } from "@/lib/jwt"
import { SessionType } from "@/types/auth"
import { PublicSessionType } from "@/types/session"
import { env } from "@/configs/env"
import {
  getClientIPFromHeaders,
  getUserAgentFromHeaders,
} from "@/lib/custom-rate-limiter"
import { headers } from "next/headers"
import { describeIpForDisplay } from "@/utils/mask-ip"
import { parseUserAgent } from "@/utils/parse-user-agent"

interface OAuthUserInfo {
  name: string
  email: string
  avatar?: string
  provider: string
  providerAccountId: string
  isEmailVerified: boolean
}

export async function getOrCreateOAuthUser(userInfo: OAuthUserInfo) {
  return await db.transaction(async (tx) => {
    // 1. Check OAuth account
    const [existingAccount] = await tx
      .select({
        userId: accounts.userId,
      })
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, userInfo.provider),
          eq(accounts.providerAccountId, userInfo.providerAccountId)
        )
      )
      .limit(1)

    if (existingAccount) {
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, existingAccount.userId))
        .limit(1)

      return user
    }

    // 2. Check user by email
    let [user] = await tx
      .select()
      .from(users)
      .where(eq(users.email, userInfo.email))
      .limit(1)

    // 3. Create user if doesn't exist
    if (!user) {
      ;[user] = await tx
        .insert(users)
        .values({
          email: userInfo.email,
          emailVerified: userInfo.isEmailVerified,
          role: env.ADMIN_EMAIL === userInfo.email ? "ADMIN" : "USER",
          username: extractUsername(userInfo.email),
          name: userInfo.name,
          avatarUrl: userInfo.avatar,
        })
        .returning()
    }

    // 4. Create OAuth account
    await tx.insert(accounts).values({
      userId: user.id,
      provider: userInfo.provider,
      providerAccountId: userInfo.providerAccountId,
    })

    return user
  })
}

export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30 // 30 days
export const MAX_SESSIONS = 6

function userSessionsKey(userId: string) {
  return `user_sessions:${userId}`
}

function sessionKey(sessionId: string) {
  return `session:${sessionId}`
}

export async function createAuthSession({
  email,
  userId,
}: {
  userId: string
  email: string
}) {
  const sessionId = generateUUID()
  const accessToken = signAccessToken({
    sub: userId,
    email,
    sid: sessionId,
  })
  const refreshToken = signRefreshToken({
    sub: userId,
    sid: sessionId,
  })

  const refreshTokenHash = generateHashedToken(refreshToken)

  const headersList = await headers()
  const ip = getClientIPFromHeaders(headersList)
  const userAgent = getUserAgentFromHeaders(headersList)

  const sessionData: SessionType = {
    userId,
    sessionId,
    refreshTokenHash,
    userAgent,
    ip,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
  }

  const key = userSessionsKey(userId)

  await redis.zadd(key, {
    score: Date.now(),
    member: sessionId,
  })

  const sessionCount = await redis.zcard(key)

  if (sessionCount > MAX_SESSIONS) {
    const sessionsToDelete = await redis.zrange(
      key,
      0,
      sessionCount - MAX_SESSIONS - 1
    )

    for (const oldSessionId of sessionsToDelete) {
      await redis.del(sessionKey(oldSessionId as string))
      await redis.zrem(key, oldSessionId)
    }
  }

  await redis.set(sessionKey(sessionId), sessionData, {
    ex: REFRESH_TOKEN_TTL,
  })

  return {
    sessionId,
    accessToken,
    refreshToken,
  }
}

export async function refreshAccessToken(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken)

  if (!payload?.sub) {
    throw new Error("Invalid refresh token")
  }

  const session = (await redis.get(sessionKey(payload.sid))) as SessionType

  if (!session) {
    throw new Error("Invalid refresh token")
  }

  if (session.refreshTokenHash !== generateHashedToken(refreshToken)) {
    throw new Error("Invalid refresh token")
  }

  if (session.userId !== payload.sub) {
    throw new Error("Invalid refresh token")
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1)

  const newAccessToken = signAccessToken({
    sub: payload.sub,
    email: user.email,
    sid: payload.sid,
  })

  return newAccessToken
}

export async function getSession(
  sessionId: string
): Promise<SessionType | null> {
  const session = await redis.get<SessionType>(sessionKey(sessionId))
  return session ?? null
}

export async function getUserSessions(
  userId: string,
  currentSessionId: string
): Promise<PublicSessionType[]> {
  const sessionIds = await redis.zrange(userSessionsKey(userId), 0, -1)
  const sessions = await Promise.all(
    sessionIds.map((id) => redis.get<SessionType>(sessionKey(id as string)))
  )

  const now = Date.now()
  const staleIds: string[] = []

  const publicSessions = sessions
    .filter((session): session is SessionType => {
      if (!session) return false
      if (new Date(session.expiresAt).getTime() <= now) {
        staleIds.push(session.sessionId)
        return false
      }
      return true
    })
    .map((session) => toPublicSession(session, currentSessionId))

  if (staleIds.length) {
    await redis.zrem(userSessionsKey(userId), ...staleIds)
  }

  return publicSessions.sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export async function countUserSessions(userId: string): Promise<number> {
  const sessions = await getUserSessions(userId, "")
  return sessions.length
}

function toPublicSession(
  session: SessionType,
  currentSessionId: string
): PublicSessionType {
  const parsedUA = parseUserAgent(session.userAgent)
  const location = describeIpForDisplay(session.ip)

  return {
    userId: session.userId,
    sessionId: session.sessionId,
    device: parsedUA.device,
    deviceDetail: parsedUA.deviceDetail,
    deviceType: parsedUA.deviceType,
    location,
    createdAt: new Date(session.createdAt),
    expiresAt: new Date(session.expiresAt),
    isCurrent: session.sessionId === currentSessionId,
  }
}

export async function revokeSession(
  userId: string,
  sessionId: string
): Promise<{ success: boolean; message?: string }> {
  const session = await getSession(sessionId)

  if (!session) {
    return { success: false, message: "Session not found" }
  }

  if (session.userId !== userId) {
    return { success: false, message: "Unauthorized" }
  }

  await Promise.all([
    redis.del(sessionKey(sessionId)),
    redis.zrem(userSessionsKey(userId), sessionId),
  ])

  return { success: true }
}

/** Revokes every session for `userId` except `currentSessionId`. */
export async function revokeOtherSessions(
  userId: string,
  currentSessionId: string
): Promise<{ success: boolean; revokedCount: number }> {
  const sessionIds = await redis.zrange(userSessionsKey(userId), 0, -1)
  const otherIds = (sessionIds as string[]).filter(
    (id) => id !== currentSessionId
  )

  if (otherIds.length) {
    await Promise.all([
      redis.del(...otherIds.map((id) => sessionKey(id))),
      redis.zrem(userSessionsKey(userId), ...otherIds),
    ])
  }

  return { success: true, revokedCount: otherIds.length }
}

/** Revokes every session for `userId`, including the current one. */
export async function revokeAllSessions(
  userId: string
): Promise<{ success: boolean }> {
  const key = userSessionsKey(userId)
  const sessionIds = await redis.zrange(key, 0, -1)

  if (sessionIds.length) {
    await redis.del(...(sessionIds as string[]).map((id) => sessionKey(id)))
  }

  await redis.del(key)

  return { success: true }
}
