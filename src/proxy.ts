import { NextRequest, NextResponse } from "next/server"
import { JwtError, verifyAccessToken } from "./lib/jwt"
import { refreshAccessToken } from "./features/auth/auth.service"
import { ACCESS_TOKEN_TTL } from "./features/auth/auth.cookie"
import redis from "./configs/redis"
import { SessionType } from "./types/auth"
import { ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS } from "./constants/auth.constants"

const REFRESH_LEEWAY_MS = ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS * 1000

const PUBLIC_ROUTES = [
  "/",
  "/signin",
  "/contributors",
  "/privacy",
  "/terms",
  "/guidelines",
  "/community",
  "/notes",
  "/settings",
  "/collections",
]

function isPublicRoute(pathname: string) {
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/notes/") ||
    pathname.startsWith("/contributors/") ||
    pathname.startsWith("/collections/")
  ) {
    return true
  }

  // All API routes are public — they handle their own authentication
  if (pathname.startsWith("/api/")) {
    return true
  }

  return false
}
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get("access_token")?.value
  const refreshToken = request.cookies.get("refresh_token")?.value

  // Public pages still need a valid access cookie for their server components.
  if (isPublicRoute(pathname)) {
    return await refreshPublicSession(request, accessToken, refreshToken)
  }

  if (!accessToken) {
    if (!refreshToken) {
      return redirectToSignin(request)
    }

    return await handleRefresh(request, refreshToken)
  }
  // Verify access JWT
  try {
    const payload = verifyAccessToken(accessToken)

    if (!payload?.sub) {
      if (refreshToken) {
        return await handleRefresh(request, refreshToken)
      }

      return redirectToSignin(request)
    }

    if (refreshToken && shouldRefreshAccessToken(payload)) {
      return await handleRefresh(request, refreshToken)
    }

    const sessionKey = `session:${payload.sid}`

    const session = await redis.get<SessionType>(sessionKey)

    if (!session || session.userId !== payload.sub) {
      return redirectToSignin(request)
    }

    return NextResponse.next()
  } catch {
    if (!refreshToken) {
      return redirectToSignin(request)
    }

    return await handleRefresh(request, refreshToken)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

function shouldRefreshAccessToken(payload: { exp?: number }) {
  return !payload.exp || payload.exp * 1000 - Date.now() <= REFRESH_LEEWAY_MS
}

async function refreshPublicSession(
  request: NextRequest,
  accessToken: string | undefined,
  refreshToken: string | undefined
) {
  if (!refreshToken) return NextResponse.next()

  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken)

      if (payload?.sub && !shouldRefreshAccessToken(payload)) {
        return NextResponse.next()
      }
    } catch {
      // Fall through and replace the expired or invalid access token.
    }
  }

  return await handleRefresh(request, refreshToken, false)
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete("access_token")
  response.cookies.delete("refresh_token")
  response.cookies.delete("sid")
}

function redirectToSignin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/signin", request.url))
  clearAuthCookies(response)
  return response
}

function getRequestHeadersWithAccessToken(
  request: NextRequest,
  accessToken: string
) {
  const headers = new Headers(request.headers)
  const cookieHeader = headers.get("cookie")
  const cookies = cookieHeader
    ? cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .filter((cookie) => cookie && !cookie.startsWith("access_token="))
    : []

  cookies.push(`access_token=${accessToken}`)
  headers.set("cookie", cookies.join("; "))

  return headers
}

async function handleRefresh(
  request: NextRequest,
  refreshToken: string,
  redirectOnFailure = true
) {
  try {
    const newAccessToken = await refreshAccessToken(refreshToken)
    const requestHeaders = getRequestHeadersWithAccessToken(
      request,
      newAccessToken
    )

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_TTL,
    })

    return response
  } catch (error) {
    if (error instanceof JwtError) {
      const response = redirectOnFailure
        ? redirectToSignin(request)
        : NextResponse.next()

      if (!redirectOnFailure) clearAuthCookies(response)
      return response
    }

    console.error("Session refresh failed:", error)

    if (!redirectOnFailure) {
      return NextResponse.next()
    }

    return new NextResponse(
      "Unable to refresh your session. Please try again.",
      { status: 503 }
    )
  }
}
