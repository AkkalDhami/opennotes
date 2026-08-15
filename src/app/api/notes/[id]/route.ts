import { NextRequest, NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/get-current-user"
import { UpdateNoteSchema } from "@/validations/note"
import { db, notes } from "@/db"
import { eq } from "drizzle-orm"

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    /*
     * Authenticate
     */
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      )
    }

    /*
     * Authorization
     *
     * Never trust a role sent from the client.
     */
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to update notes.",
        },
        { status: 403 }
      )
    }

    const { id } = await params

    /*
     * Parse JSON
     */
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      )
    }

    /*
     * Validate
     */
    const parsed = UpdateNoteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the form for errors.",
        },
        { status: 400 }
      )
    }

    const data = parsed.data

    /*
     * Get current note
     */
    const [existingNote] = await db
      .select({
        id: notes.id,
        status: notes.status,
      })
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1)

    if (!existingNote) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found.",
        },
        { status: 404 }
      )
    }

    /*
     * Build update object.
     *
     * Do NOT allow the client to update:
     * - contributorId
     * - fileKey
     * - fileHash
     * - fileSizeBytes
     * - pageCount
     * - processingStatus
     * - downloadCount
     * - createdAt
     */
    const updateData: Partial<typeof notes.$inferInsert> = {
      title: data.title,
      description: data.description || null,
      subject: data.subject,
      category: data.category,
      educationLevel: data.educationLevel,
      course: data.course || "Unknown",
      grade: data.grade,
      topic: data.topic || null,
      academicYear: data.academicYear || null,
      tags: data.tags,
      status: data.status,
      rejectionReason:
        data.status === "REJECTED" ? data.rejectionReason || null : null,
    }

    /*
     * Set publishedAt when the note becomes published.
     */
    if (data.status === "PUBLISHED" && existingNote.status !== "PUBLISHED") {
      updateData.publishedAt = new Date()
    }

    /*
     * If it was already published, don't overwrite
     * the original publication date.
     */
    const [updatedNote] = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      message: "Note updated successfully.",
      data: updatedNote,
    })
  } catch (error) {
    console.error("[PATCH /api/notes/[id]]", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update note.",
      },
      { status: 500 }
    )
  }
}