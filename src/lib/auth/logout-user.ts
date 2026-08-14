"use server"

import redis from "@/configs/redis"
import { verifyRefreshToken } from "../jwt"
import { cookies } from "next/headers"

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

  await redis.del(`session:${decodedToken.sid}`)

  cookieStore.delete("access_token")
  cookieStore.delete("refresh_token")

  return true
}

export async function logoutUser() {
  return await removeAuthCookie()
}
