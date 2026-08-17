import { z } from "zod"

import {
  ALLOWED_NOTE_FILE_MIME_TYPES,
  MAX_NOTE_FILE_SIZE,
  NOTE_ACADEMIC_YEAR_MAX_LENGTH,
  NOTE_DESCRIPTION_MAX_LENGTH,
  NOTE_EDUCATION_LEVEL_MAX_LENGTH,
  NOTE_GRADE_MAX_LENGTH,
  NOTE_TITLE_MAX_LENGTH,
  NOTE_TITLE_MIN_LENGTH,
  NOTE_TOPIC_MAX_LENGTH,
} from "@/constants/notes.constants"
import { NOTE_SOURCES } from "@/db"

/**
 * Shared fields used by:
 * - Client form
 * - Server validation
 *
 * Never trust the client-side validation alone.
 */

export const ContributionFieldsSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(NOTE_TITLE_MIN_LENGTH, "Title must be at least 3 characters.")
      .max(NOTE_TITLE_MAX_LENGTH, "Title cannot exceed 255 characters."),

    description: z
      .string()
      .trim()
      .max(
        NOTE_DESCRIPTION_MAX_LENGTH,
        "Description cannot exceed 2000 characters."
      )
      .optional()
      .or(z.literal("")),

    subject: z.string().min(1, "Please select a valid subject."),

    category: z.string().min(1, "Please select a valid category."),

    educationLevel: z
      .string()
      .min(1, "Please select a valid education level.")
      .max(NOTE_EDUCATION_LEVEL_MAX_LENGTH),

    course: z.string().max(80).min(1, "Please select a course."),

    grade: z
      .string()
      .max(NOTE_GRADE_MAX_LENGTH)
      .min(1, "Please select a grade."),

    topic: z.string().max(NOTE_TOPIC_MAX_LENGTH).optional().or(z.literal("")),

    academicYear: z
      .string()
      .max(NOTE_ACADEMIC_YEAR_MAX_LENGTH)
      .optional()
      .or(z.literal("")),

    /**
     * Store tags as a comma-separated string in the form.
     *
     * Example:
     * "physics, optics, class 12"
     */
    tags: z.string().optional(),

    sourceType: z.enum(NOTE_SOURCES, {
      message: "Please select how this note can be shared.",
    }),
    originalAuthor: z
      .string()
      .trim()
      .max(255, "Author name cannot exceed 255 characters.")
      .optional()
      .or(z.literal("")),

    sourceUrl: z
      .url("Please provide a valid source URL.")
      .optional()
      .or(z.literal("")),

    shareConfirmation: z
      .boolean()
      .refine(
        (value) => value === true,
        "You must confirm that you have the right to share this material."
      ),
  })
  .superRefine((data, ctx) => {
    if (
      data.sourceType === "PERMISSION_GRANTED" &&
      !data.originalAuthor?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["originalAuthor"],
        message: "Please provide the original author's name.",
      })
    }

    if (data.sourceType === "OPEN_LICENSE" && !data.originalAuthor?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["originalAuthor"],
        message: "Please provide the original author's name.",
      })
    }

    if (data.sourceType === "OPEN_LICENSE" && !data.sourceUrl?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceUrl"],
        message: "Please provide the original source or license URL.",
      })
    }

    if (data.sourceType === "PUBLIC_DOMAIN" && !data.sourceUrl?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceUrl"],
        message: "Please provide a source URL so we can verify it.",
      })
    }
  })

export type ContributionFieldValues = z.infer<typeof ContributionFieldsSchema>

/**
 * Client-only schema.
 *
 * Adds the uploaded PDF File to the shared fields.
 */
export const contributionFormSchema = ContributionFieldsSchema.extend({
  file: z
    .instanceof(File, {
      message: "Please select a PDF file.",
    })
    .refine((file) => file.size > 0, "The selected file is empty.")
    .refine(
      (file) => file.size <= MAX_NOTE_FILE_SIZE,
      "File size must be less than 10 MB."
    )
    .refine(
      (file) =>
        (ALLOWED_NOTE_FILE_MIME_TYPES as readonly string[]).includes(file.type),
      "Please upload a valid PDF file."
    ),
})

export type ContributionFormValues = z.infer<typeof contributionFormSchema>

/**
 * Convert empty FormData values to undefined.
 */
const emptyToUndefined = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed === "" ? undefined : trimmed
}

/**
 * Parse and validate contribution FormData.
 *
 * This runs on the server.
 */
export const parseContributionFormData = (formData: FormData) => {
  const raw = {
    title: emptyToUndefined(formData.get("title")),

    description: emptyToUndefined(formData.get("description")),

    subject: emptyToUndefined(formData.get("subject")),

    category: emptyToUndefined(formData.get("category")),

    educationLevel: emptyToUndefined(formData.get("educationLevel")),

    course: emptyToUndefined(formData.get("course")),

    grade: emptyToUndefined(formData.get("grade")),

    topic: emptyToUndefined(formData.get("topic")),

    academicYear: emptyToUndefined(formData.get("academicYear")),

    tags: emptyToUndefined(formData.get("tags")),

    sourceType: emptyToUndefined(formData.get("sourceType")) ?? "ORIGINAL",

    originalAuthor: emptyToUndefined(formData.get("originalAuthor")),

    sourceUrl: emptyToUndefined(formData.get("sourceUrl")),
  }

  return ContributionFieldsSchema.safeParse(raw)
}

/**
 * Server-side PDF validation.
 *
 * The server must independently validate the uploaded file.
 */

export interface ServerFileValidationError {
  code:
    | "MISSING_FILE"
    | "INVALID_TYPE"
    | "TOO_LARGE"
    | "EMPTY_FILE"
    | "BAD_FILENAME"

  message: string
}

const SAFE_FILENAME_PATTERN = /^[\w,\s\-.()[\]]{1,255}\.pdf$/i

export const validateUploadedPdf = (
  file: File | null | undefined
): ServerFileValidationError | null => {
  if (!file) {
    return {
      code: "MISSING_FILE",
      message: "Please upload a valid PDF file.",
    }
  }

  if (file.size <= 0) {
    return {
      code: "EMPTY_FILE",
      message: "The uploaded file is empty.",
    }
  }

  if (file.size > MAX_NOTE_FILE_SIZE) {
    return {
      code: "TOO_LARGE",
      message: "File size must be less than 10 MB.",
    }
  }

  if (
    !(ALLOWED_NOTE_FILE_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return {
      code: "INVALID_TYPE",
      message: "Please upload a valid PDF file.",
    }
  }

  if (!SAFE_FILENAME_PATTERN.test(file.name)) {
    return {
      code: "BAD_FILENAME",
      message: "Please upload a valid PDF file.",
    }
  }

  return null
}
