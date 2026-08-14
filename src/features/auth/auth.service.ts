import { db } from "@/db"
import { accounts, users } from "@/db"
import { eq, and } from "drizzle-orm"
import { extractUsername } from "@/utils/extract-username"
import redis from "@/configs/redis"
import {
  generateHashedToken,
  generateSecureToken,
} from "@/helpers/token.helper"
import { signAccessToken, signRefreshToken } from "@/lib/jwt"

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

export async function createAuthSession({
  email,
  userId,
}: {
  userId: string
  email: string
}) {
  const sessionId = generateSecureToken(32)
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

  await redis.set(
    `session:${sessionId}`,
    {
      userId,
      refreshTokenHash,
    },
    {
      ex: REFRESH_TOKEN_TTL,
    }
  )

  return {
    sessionId,
    accessToken,
    refreshToken,
  }
}

import { verifyRefreshToken } from "@/lib/jwt"
import { SessionType } from "@/types/auth"
import { env } from "@/configs/env";

export async function refreshAccessToken(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken)

  if (!payload?.sub) {
    throw new Error("Invalid refresh token")
  }

  const session = (await redis.get(`session:${payload.sid}`)) as SessionType

  if (!session) {
    throw new Error("Invalid refresh token")
  }

  if (session.refreshTokenHash !== generateHashedToken(refreshToken)) {
    throw new Error("Invalid refresh token")
  }

  if (session.userId !== payload.sub) {
    throw new Error("Invalid refresh token")
  }

  await redis.del(`session:${payload.sid}`)

  await redis.set(
    `session:${payload.sid}`,
    {
      userId: payload.sub,
      refreshTokenHash: session.refreshTokenHash,
    },
    {
      ex: REFRESH_TOKEN_TTL,
    }
  )

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