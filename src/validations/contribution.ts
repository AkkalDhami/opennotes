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

/**
 * Shared "field" schema — used by the client form (React Hook Form +
 * zodResolver) and re-validated again on the server. Never trust the
 * client-side pass alone.
 */
export const ContributionFieldsSchema = z.object({
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

  grade: z.string().max(NOTE_GRADE_MAX_LENGTH).min(1, "Please select a grade."),

  topic: z.string().max(NOTE_TOPIC_MAX_LENGTH).optional().or(z.literal("")),

  academicYear: z
    .string()
    .max(NOTE_ACADEMIC_YEAR_MAX_LENGTH)
    .optional()
    .or(z.literal("")),

  // tags is optionl (i get like t, t, t)
  tags: z.string().optional(),
})

export type ContributionFieldValues = z.infer<typeof ContributionFieldsSchema>

/**
 * Client-only schema: fields + a File instance, so React Hook Form can
 * validate "no file selected" inline with the rest of the form.
 */
export const contributionFormSchema = ContributionFieldsSchema.extend({
  file: z
    .instanceof(File, { message: "Please select a PDF file." })
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
 * Server-side schema for the raw fields pulled out of `FormData`. Every
 * value arriving from `FormData` is a string (or null), so this coerces
 * empty strings to `undefined` before handing off to the shared field
 * schema above.
 */
const emptyToUndefined = (value: FormDataEntryValue | null) =>
  typeof value === "string" && value.trim() !== "" ? value : undefined

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
  }

  return ContributionFieldsSchema.safeParse(raw)
}

/**
 * Server-side PDF validation. Deliberately independent from the client
 * schema above — the server must never rely on the browser having done
 * this correctly.
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

const SAFE_FILENAME_PATTERN = /^[\w,\s\-.()\[\]]{1,255}\.pdf$/i

export const validateUploadedPdf = (
  file: File | null | undefined
): ServerFileValidationError | null => {
  if (!file) {
    return { code: "MISSING_FILE", message: "Please upload a valid PDF file." }
  }

  if (file.size <= 0) {
    return { code: "EMPTY_FILE", message: "The uploaded file is empty." }
  }

  if (file.size > MAX_NOTE_FILE_SIZE) {
    return { code: "TOO_LARGE", message: "File size must be less than 10 MB." }
  }

  if (
    !(ALLOWED_NOTE_FILE_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return { code: "INVALID_TYPE", message: "Please upload a valid PDF file." }
  }

  // Filename is only used for display / audit purposes — never trusted as a
  // storage key — but it's still worth rejecting obviously unreasonable
  // names (path separators, control characters, wrong extension, etc.).
  if (!SAFE_FILENAME_PATTERN.test(file.name)) {
    return {
      code: "BAD_FILENAME",
      message: "Please upload a valid PDF file.",
    }
  }

  return null
}
