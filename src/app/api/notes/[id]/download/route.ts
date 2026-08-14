import { NextResponse } from "next/server"
import { db, downloads, notes } from "@/db"
import { and, eq, sql } from "drizzle-orm"
import { getFileUrl } from "@/utils/get-file-url"
import { generateHashDownloader } from "@/helpers/token.helper"

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const { id } = await params

    const forwardedFor = request.headers.get("x-forwarded-for")

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const [note] = await db
      .select({
        id: notes.id,
        filePath: notes.filePath,
        originalFileName: notes.originalFileName,
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
    return NextResponse.redirect(fileUrl)
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
