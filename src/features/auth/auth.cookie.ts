import { cookies } from "next/headers"
import { REFRESH_TOKEN_TTL } from "./auth.service"

export async function setAuthCookie({
  refreshToken,
  accessToken,
}: {
  refreshToken: string
  accessToken: string
}) {
  await setAccessToken(accessToken)
  await setRefreshToken(refreshToken)
}

export async function setRefreshToken(refreshToken: string) {
  const cookieStore = await cookies()
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL, // 30 days
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("access_token")
  cookieStore.delete("refresh_token")
}

export const ACCESS_TOKEN_TTL = 60 * 15

export async function setAccessToken(accessToken: string) {
  const cookieStore = await cookies()
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL, // 15 minutes
  })
}
