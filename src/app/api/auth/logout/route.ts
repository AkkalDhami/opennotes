import redis from "@/configs/redis"
import { generateHashedToken } from "@/helpers/token.helper"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { verifyRefreshToken } from "@/lib/jwt"
import { SessionType } from "@/types/auth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized, please log in.",
        },
        { status: 401 }
      )
    }

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not logged in.",
        },
        { status: 401 }
      )
    }

    const { sid, sub } = verifyRefreshToken(refreshToken)

    if (!sid || !sub) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not logged in.",
        },
        { status: 401 }
      )
    }

    const hashedRefreshToken = generateHashedToken(refreshToken)

    const session = (await redis.get(`session:${sid}`)) as SessionType

    if (!session.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not logged in.",
        },
        { status: 401 }
      )
    }

    if (session.refreshTokenHash !== hashedRefreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
        },
        { status: 401 }
      )
    }

    if (session.userId !== sub) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
        },
        { status: 401 }
      )
    }

    await redis.del(`session:${sid}`)

    cookieStore.delete("refresh_token")
    cookieStore.delete("access_token")
  } catch (error) {
    console.error("[POST /api/auth/logout] Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    )
  }
}
