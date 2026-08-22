import { NextRequest, NextResponse } from "next/server"

import { db, NOTE_STATUS, notes } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { ContributionFieldsSchema } from "@/validations/contribution"
import { and, eq, inArray } from "drizzle-orm"

export const EDITABLE_NOTE_STATUSES = NOTE_STATUS.filter(
  (status) => status !== "REMOVED"
)

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/notes/[id]/contribution">
) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { success: false, message: "You must be signed in to edit a note." },
      { status: 401 }
    )
  }

  const { id } = await params
  const isAdmin = user.role === "ADMIN"

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid submission." },
      { status: 400 }
    )
  }

  const parsed = ContributionFieldsSchema.safeParse({
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    subject: formData.get("subject") || undefined,
    category: formData.get("category") || undefined,
    educationLevel: formData.get("educationLevel") || undefined,
    course: formData.get("course") || undefined,
    grade: formData.get("grade") || undefined,
    topic: formData.get("topic") || undefined,
    academicYear: formData.get("academicYear") || undefined,
    tags: formData.get("tags") || undefined,
    sourceType: formData.get("sourceType") || undefined,
    originalAuthor: formData.get("originalAuthor") || undefined,
    sourceUrl: formData.get("sourceUrl") || undefined,
    shareConfirmation: formData.get("shareConfirmation") === "true",
  })

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Please check the form for errors." },
      { status: 400 }
    )
  }

  const fields = parsed.data
  const isDraft = formData.get("status") === "DRAFT"
  const updateData: Partial<typeof notes.$inferInsert> = {
    title: fields.title,
    description: fields.description || null,
    subject: fields.subject,
    category: fields.category,
    educationLevel: fields.educationLevel,
    course: fields.course,
    grade: fields.grade,
    topic: fields.topic || null,
    academicYear: fields.academicYear || null,
    tags:
      fields.tags
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean) ?? [],
    sourceType: fields.sourceType,
    originalAuthor: fields.originalAuthor || null,
    sourceUrl: fields.sourceUrl || null,
  }

  if (!isAdmin) {
    updateData.rejectionReason = null
    updateData.status = isDraft ? "DRAFT" : "PENDING_REVIEW"
  }

  const [updatedNote] = await db
    .update(notes)
    .set(updateData)
    .where(
      isAdmin
        ? eq(notes.id, id)
        : and(
            eq(notes.id, id),
            eq(notes.contributorId, user.id),
            inArray(notes.status, EDITABLE_NOTE_STATUSES)
          )
    )
    .returning({ id: notes.id, status: notes.status })

  if (!updatedNote) {
    return NextResponse.json(
      {
        success: false,
        message:
          "This note is unavailable for editing, or you do not have permission to edit it.",
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    message: isAdmin
      ? "Note updated successfully."
      : isDraft
        ? "Draft saved successfully."
        : "Your note has been updated and submitted for review.",
    data: updatedNote,
  })
}
