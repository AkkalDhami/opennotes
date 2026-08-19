import { NextRequest, NextResponse } from "next/server"

import {
  CreateNoteError,
  createNoteFromFormData,
} from "@/lib/notes/create-note"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
} from "@/lib/custom-rate-limiter"

export async function POST(request: NextRequest) {
  let userId: string

  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in to contribute notes.",
        },
        { status: 401 }
      )
    }

    const clientIP = getClientIP(request)

    const uploadConfig = RATE_LIMITS.upload

    const ipLimit = checkRateLimit(`upload:ip:${clientIP}`, uploadConfig)

    const userLimit = checkRateLimit(`upload:user:${user.id}`, uploadConfig)

    if (!ipLimit.allowed || !userLimit.allowed) {
      const resetTime = Math.max(ipLimit.resetTime, userLimit.resetTime)

      return NextResponse.json(
        {
          success: false,
          message: "You've reached the upload limit. Please try again later.",
          error: {
            status: 429,
            retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": uploadConfig.maxRequests.toString(),

            "X-RateLimit-Remaining": "0",

            "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),

            "Retry-After": Math.ceil(
              (resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      )
    }

    userId = user.id
  } catch (error) {
    console.error("[POST /api/notes] Auth error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "You must be signed in to contribute notes.",
      },
      { status: 401 }
    )
  }

  let formData: FormData

  try {
    formData = await request.formData()

    // console.log("[POST /api/notes] Keys:", Array.from(formData.keys()))
  } catch (error) {
    console.error("[POST /api/notes] FormData error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Invalid submission.",
      },
      { status: 400 }
    )
  }

  try {
    const note = await createNoteFromFormData({
      contributorId: userId,
      formData,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Note submitted successfully.",
        data: {
          id: note.id,
          status: note.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/notes] Create note error:", error)

    if (error instanceof CreateNoteError) {
      const status =
        error.code === "DUPLICATE_FILE" || error.code === "INVALID_FILE"
          ? 409
          : error.code === "VALIDATION_ERROR"
            ? 400
            : 502

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Your note could not be submitted. Please try again.",
      },
      { status: 500 }
    )
  }
}
