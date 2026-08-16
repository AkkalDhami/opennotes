import "server-only"

import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/jwt"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"

export async function getCurrentUser() {
  const cookieStore = await cookies()

  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    return null
  }

  try {
    const payload = await verifyAccessToken(accessToken)

    if (!payload?.sub) {
      return null
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        bio: users.bio,
        avatar: users.avatarUrl,
        avatarId: users.avatarId,
        role: users.role,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1)

    return user ?? null
  } catch {
    return null
  }
}
