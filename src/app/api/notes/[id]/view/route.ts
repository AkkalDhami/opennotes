import { NextRequest, NextResponse } from "next/server"
import { and, eq, sql } from "drizzle-orm"

import { db, notes } from "@/db"
import { revalidatePath } from "next/cache"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [note] = await db
      .update(notes)
      .set({
        viewCount: sql`${notes.viewCount} + 1`,
      })
      .where(and(eq(notes.id, id), eq(notes.status, "PUBLISHED")))
      .returning({
        slug: notes.slug,
      })

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found.",
        },
        { status: 404 }
      )
    }

    revalidatePath(`/notes/${note.slug}`)

    return NextResponse.json({
      success: true,
      isNewView: true,
    })
  } catch (error) {
    console.error("Failed to record note view:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    )
  }
}
