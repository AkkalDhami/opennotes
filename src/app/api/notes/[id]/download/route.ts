import { NextRequest, NextResponse } from "next/server"
import { and, eq, sql } from "drizzle-orm"

import { db, downloads, notes } from "@/db"
import { getFileUrl } from "@/utils/get-file-url"
import { generateHashDownloader } from "@/helpers/token.helper"
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
} from "@/lib/custom-rate-limiter"
import { getCurrentUser } from "@/lib/auth/get-current-user"

type DownloadMode = "file" | "url"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIP(request)

    const user = await getCurrentUser()

    const key = user ? `download:user:${user.id}` : `download:ip:${ip}`

    const rateLimit = checkRateLimit(key, RATE_LIMITS.download)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMITS.download.maxRequests.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": (
              Date.now() + RATE_LIMITS.download.windowMs
            ).toString(),
            "Retry-After": String(
              Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    const { id } = await params

    const { searchParams } = new URL(request.url)
    const mode = (searchParams.get("mode") ?? "file") as DownloadMode

    if (mode !== "file" && mode !== "url") {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid mode. Use "file" or "url".',
        },
        { status: 400 }
      )
    }

    const [note] = await db
      .select({
        id: notes.id,
        filePath: notes.filePath,
        originalFileName: notes.originalFileName,
        slug: notes.slug,
      })
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.status, "PUBLISHED")))

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found.",
        },
        { status: 404 }
      )
    }

    const downloaderHash = generateHashDownloader(ip)

    const inserted = await db
      .insert(downloads)
      .values({
        noteId: note.id,
        downloaderHash,
      })
      .onConflictDoNothing({
        target: [downloads.noteId, downloads.downloaderHash],
      })
      .returning({
        id: downloads.id,
      })

    if (inserted.length > 0) {
      await db
        .update(notes)
        .set({
          downloadCount: sql`${notes.downloadCount} + 1`,
        })
        .where(eq(notes.id, note.id))
    }

    const fileUrl = getFileUrl(note.filePath)

    // Return the URL instead of downloading the file.
    if (mode === "url") {
      return NextResponse.json({
        success: true,
        url: fileUrl,
        fileName: note.originalFileName ?? `${note.slug}.pdf`,
      })
    }

    // Fetch and stream the actual file.
    const response = await fetch(fileUrl)

    if (!response.ok || !response.body) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to fetch note file.",
        },
        { status: 500 }
      )
    }

    const contentType =
      response.headers.get("content-type") ?? "application/pdf"

    const fileName = note.originalFileName ?? `${note.slug}.pdf`

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("[GET /api/notes/[id]/download]", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to download note.",
      },
      { status: 500 }
    )
  }
}
