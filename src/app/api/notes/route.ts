import { NextRequest, NextResponse } from "next/server"

import {
  CreateNoteError,
  createNoteFromFormData,
} from "@/lib/notes/create-note"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { UpdateNoteSchema } from "@/validations/note";
import { db, notes } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  console.log("🔥 /api/notes POST REACHED")

  let userId: string

  try {
    console.log("[POST /api/notes] Getting current user")

    const user = await getCurrentUser()

    console.log("[POST /api/notes] User:", user?.id)

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

  console.log("[POST /api/notes] Reading formData")

  let formData: FormData

  try {
    formData = await request.formData()

    console.log("[POST /api/notes] FormData received")

    console.log("[POST /api/notes] Keys:", Array.from(formData.keys()))
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
    console.log("[POST /api/notes] Creating note...")

    const note = await createNoteFromFormData({
      contributorId: userId,
      formData,
    })

    console.log("[POST /api/notes] Note created:", note.id)

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
    console.error("[PATCH /api/admin/notes/[id]]", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update note.",
      },
      { status: 500 }
    )
  }
}