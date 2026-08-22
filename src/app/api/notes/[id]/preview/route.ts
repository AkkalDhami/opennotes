import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { db, notes } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { getFileUrl } from "@/utils/get-file-url"

export async function GET(
  _request: NextRequest,
  { params }: RouteContext<"/api/notes/[id]/preview">
) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { success: false, message: "You must be signed in to preview a note." },
      { status: 401 }
    )
  }

  const { id } = await params
  const [note] = await db
    .select({
      id: notes.id,
      filePath: notes.filePath,
      originalFileName: notes.originalFileName,
      slug: notes.slug,
    })
    .from(notes)
    .where(
      user.role === "ADMIN"
        ? eq(notes.id, id)
        : and(eq(notes.id, id), eq(notes.contributorId, user.id))
    )
    .limit(1)

  if (!note) {
    return NextResponse.json(
      { success: false, message: "Note not found." },
      { status: 404 }
    )
  }

  try {
    const response = await fetch(getFileUrl(note.filePath))

    if (!response.ok || !response.body) {
      throw new Error("Unable to fetch note file.")
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/pdf",
        "Content-Disposition": `inline; filename="${note.originalFileName ?? `${note.slug}.pdf`}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("[GET /api/notes/[id]/preview]", error)

    return NextResponse.json(
      { success: false, message: "Unable to load the note preview." },
      { status: 502 }
    )
  }
}
