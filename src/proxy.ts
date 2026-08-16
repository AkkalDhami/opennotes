import { NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "./lib/jwt"
import { refreshAccessToken } from "./features/auth/auth.service"
import { ACCESS_TOKEN_TTL } from "./features/auth/auth.cookie"

const PUBLIC_ROUTES = [
  "/",
  "/signin",
  "/contributors",
  "/privacy",
  "/terms",
  "/guidelines",
  "/community",
  "/notes",
]

function isPublicRoute(pathname: string) {
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/notes/") ||
    pathname.startsWith("/contributors/")
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

  // Public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get("access_token")?.value
  const refreshToken = request.cookies.get("refresh_token")?.value

  if (!accessToken) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/signin", request.url))
    }

    return await handleRefresh(request, refreshToken)
  }
  // Verify access JWT
  try {
    const payload = verifyAccessToken(accessToken)

    if (!payload?.sub) {
      return NextResponse.redirect(new URL("/signin", request.url))
    }

    return NextResponse.next()
  } catch {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/signin", request.url))
    }

    return await handleRefresh(request, refreshToken)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

async function handleRefresh(request: NextRequest, refreshToken: string) {
  try {
    const newAccessToken = await refreshAccessToken(refreshToken)

    const response = NextResponse.next()

    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_TTL,
    })

    return response
  } catch {
    return NextResponse.redirect(new URL("/signin", request.url))
  }
}
