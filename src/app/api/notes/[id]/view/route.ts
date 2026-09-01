import { NextRequest, NextResponse } from "next/server"
import { and, eq, sql } from "drizzle-orm"

import { db, notes, views } from "@/db"
import { generateTokenAndHashedToken } from "@/helpers/token.helper"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { env } from "@/configs/env"
import { getClientIP } from "@/lib/custom-rate-limiter"
import { revalidatePath } from "next/cache"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await getCurrentUser()

    const viewerKey = user ? `user:${user.id}` : `ip:${getClientIP(request)}`

    const { hashedToken } = generateTokenAndHashedToken(
      viewerKey,
      env.VIEWER_HASH_SECRET
    )

    const [note] = await db
      .select({
        id: notes.id,
        slug: notes.slug,
      })
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.status, "PUBLISHED")))
      .limit(1)

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found.",
        },
        { status: 404 }
      )
    }

    const inserted = await db
      .insert(views)
      .values({
        noteId: note.id,
        viewerHash: hashedToken,
      })
      .onConflictDoNothing({
        target: [views.noteId, views.viewerHash],
      })
      .returning({
        id: views.id,
      })

    const isNewView = inserted.length > 0

    if (isNewView) {
      await db
        .update(notes)
        .set({
          viewCount: sql`${notes.viewCount} + 1`,
        })
        .where(eq(notes.id, note.id))
    }

    revalidatePath(`/notes/${note.slug}`)

    return NextResponse.json({
      success: true,
      isNewView,
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
