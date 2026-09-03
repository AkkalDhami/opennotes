import "server-only"

import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/jwt"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"
import redis from "@/configs/redis"
import { UserType } from "@/types/auth"
import {
  REFRESH_TOKEN_TTL,
  refreshAccessToken,
} from "@/features/auth/auth.service"
import { setAccessToken } from "@/features/auth/auth.cookie"

export async function getCurrentUser() {
  const cookieStore = await cookies()

  const accessToken = cookieStore.get("access_token")?.value
  const refreshToken = cookieStore.get("refresh_token")?.value

  let payload = accessToken ? verifyAccessToken(accessToken) : null

  if (!payload?.sub && refreshToken) {
    try {
      const newAccessToken = await refreshAccessToken(refreshToken)
      await setAccessToken(newAccessToken)
      payload = verifyAccessToken(newAccessToken)
    } catch {
      return null
    }
  }

  if (!payload?.sub) {
    return null
  }

  try {
    const userInRedis = (await redis.get(`user:${payload.sub}`)) as UserType

    if (userInRedis) {
      return userInRedis
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified ?? false,
        bio: users.bio,
        avatar: users.avatarUrl,
        avatarId: users.avatarId,
        role: users.role,
        username: users.username,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1)

    if (user) {
      await redis.set(`user:${payload.sub}`, user, {
        ex: REFRESH_TOKEN_TTL,
      })
    }

    return user ?? null
  } catch {
    return null
  }
}
