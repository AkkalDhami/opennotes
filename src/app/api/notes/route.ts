import { NextRequest, NextResponse } from "next/server"

import {
  CreateNoteError,
  createNoteFromFormData,
} from "@/lib/notes/create-note"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW,
} from "@/lib/custom-rate-limiter"

export async function POST(request: NextRequest) {
  let userId: string

  try {
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(clientIP)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
          error: {
            retryAfter: RATE_LIMIT_WINDOW / 1000,
            status: 429,
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": (Date.now() + RATE_LIMIT_WINDOW).toString(),
          },
        }
      )
    }

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
