import { createHash } from "node:crypto"

import { eq } from "drizzle-orm"

import {
  cleanupOrphanedNoteFile,
  uploadNotePdf,
} from "@/services/imagekit.service"
import {
  ContributionFieldsSchema,
  validateUploadedPdf,
} from "@/validations/contribution"
import { generateUniqueSlug } from "@/utils/slug"
import { db, NewNoteType, notes } from "@/db"

export type CreateNoteErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_FILE"
  | "DUPLICATE_FILE"
  | "UPLOAD_FAILED"
  | "DATABASE_ERROR"
  | "CONFLICT_SLUG"

export class CreateNoteError extends Error {
  code: CreateNoteErrorCode

  constructor(code: CreateNoteErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

interface CreateNoteInput {
  contributorId: string
  formData: FormData
}

interface CreateNoteResult {
  id: string
  status: "PENDING_REVIEW"
}

const USER_FACING_MESSAGES: Record<CreateNoteErrorCode, string> = {
  VALIDATION_ERROR: "Please check the form for errors and try again.",
  INVALID_FILE: "Please upload a valid PDF file.",
  DUPLICATE_FILE: "This PDF has already been submitted.",
  CONFLICT_SLUG: "This title has already been submitted.",
  UPLOAD_FAILED: "We couldn't upload your PDF. Please try again.",
  DATABASE_ERROR: "Your note could not be submitted. Please try again.",
}

export const getUserFacingMessage = (code: CreateNoteErrorCode): string =>
  USER_FACING_MESSAGES[code]

/**
 * The full server-side contribution flow described in the spec
 * (sections 15-20): validate fields, validate the PDF, hash it, reject
 * duplicates, upload to ImageKit, insert the row, and roll back the
 * upload if the insert fails.
 *
 * `contributorId` MUST come from the authenticated session
 * (`requireAuth()`) in the caller — never from the client payload.
 */
export const createNoteFromFormData = async ({
  contributorId,
  formData,
}: CreateNoteInput): Promise<CreateNoteResult> => {
  // 1. Validate the text fields.
  const rawFields = {
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    subject: formData.get("subject") || undefined,
    category: formData.get("category") || undefined,
    educationLevel: formData.get("educationLevel") || undefined,
    course: formData.get("course") || undefined,
    grade: formData.get("grade") || undefined,
    topic: formData.get("topic") || undefined,
    academicYear: formData.get("academicYear") || undefined,
  }

  const parsedFields = ContributionFieldsSchema.safeParse(rawFields)
  if (!parsedFields.success) {

     console.error(
       "[createNoteFromFormData] Validation errors:",
       parsedFields.error.flatten()
     )

     console.error("[createNoteFromFormData] Raw fields:", rawFields)

    throw new CreateNoteError(
      "VALIDATION_ERROR",
      getUserFacingMessage("VALIDATION_ERROR")
    )
  }
  const fields = parsedFields.data

  // 2. Validate the PDF itself (never trust the client's own checks).
  const fileEntry = formData.get("file")
  const file = fileEntry instanceof File ? fileEntry : null

  const fileError = validateUploadedPdf(file)
  if (fileError || !file) {
    throw new CreateNoteError(
      "INVALID_FILE",
      getUserFacingMessage("INVALID_FILE")
    )
  }

  // 3. Read into a Buffer and hash it — size/hash always come from the
  // actual bytes the server received, never from client-claimed values.
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const fileSizeBytes = buffer.byteLength
  const fileHash = createHash("sha256").update(buffer).digest("hex")

  // 4. Duplicate detection, before any upload happens.
  const existing = await db
    .select({ id: notes.id })
    .from(notes)
    .where(eq(notes.fileHash, fileHash))
    .limit(1)

  if (existing.length > 0) {
    throw new CreateNoteError(
      "DUPLICATE_FILE",
      getUserFacingMessage("DUPLICATE_FILE")
    )
  }

  // 5. Generate a unique slug from the title.
  const slug = await generateUniqueSlug(fields.title, async (candidate) => {
    const rows = await db
      .select({ id: notes.id })
      .from(notes)
      .where(eq(notes.slug, candidate))
      .limit(1)
    return rows.length > 0
  })

  const existingSlug = await db
    .select({ id: notes.id })
    .from(notes)
    .where(eq(notes.slug, slug))
    .limit(1)
  if (existingSlug.length > 0) {
    throw new CreateNoteError(
      "DUPLICATE_FILE",
      getUserFacingMessage("DUPLICATE_FILE")
    )
  }

  // 6. Upload to ImageKit.
  let uploaded
  try {
    uploaded = await uploadNotePdf(buffer, {
      userId: contributorId,
      title: fields.title,
    })
  } catch (error) {
    console.error("[create-note] ImageKit upload failed:", error)
    throw new CreateNoteError(
      "UPLOAD_FAILED",
      getUserFacingMessage("UPLOAD_FAILED")
    )
  }

  // 7. Insert the row. On failure, clean up the now-orphaned ImageKit file.

  const newNote: NewNoteType = {
    slug: slug,
    title: fields.title,
    description: fields.description || null,
    contributorId,
    subject: fields.subject,
    category: fields.category,

    educationLevel: fields.educationLevel,
    course: fields.course,
    grade: fields.grade,
    topic: fields.topic || null,
    academicYear: fields.academicYear || null,

    originalFileName: file.name,
    filePath: uploaded.filePath,
    fileKey: uploaded.fileId,
    fileHash,
    fileSizeBytes,
    pageCount: null,

    processingStatus: "PROCESSING",
    status: "PENDING_REVIEW",

    downloadCount: 0,
  }

  try {
    const [row] = await db
      .insert(notes)
      .values(newNote)
      .returning({ id: notes.id, status: notes.status })

    return { id: row.id, status: "PENDING_REVIEW" }
  } catch (error) {
    console.error("[create-note] Database insert failed:", error)
    await cleanupOrphanedNoteFile(uploaded.fileId)
    throw new CreateNoteError(
      "DATABASE_ERROR",
      getUserFacingMessage("DATABASE_ERROR")
    )
  }
}
