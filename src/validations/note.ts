import { z } from "zod"

export const NOTE_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "REMOVED",
] as const

export const UpdateNoteSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(255, "Title must be 255 characters or less."),

    description: z
      .string()
      .trim()
      .max(1000, "Description must be 1000 characters or less.")
      .optional()
      .or(z.literal("")),

    subject: z.string().trim().min(1, "Subject is required."),

    category: z.string().trim().min(1, "Category is required."),

    educationLevel: z.string().trim().min(1, "Educational level is required."),

    course: z
      .string()
      .trim()
      .max(64, "Course must be 64 characters or less.")
      .optional()
      .or(z.literal("")),

    grade: z.string().trim().min(1, "Grade is required."),

    topic: z
      .string()
      .trim()
      .max(128, "Topic must be 128 characters or less.")
      .optional()
      .or(z.literal("")),

    academicYear: z
      .string()
      .trim()
      .max(16, "Academic year must be 16 characters or less.")
      .optional()
      .or(z.literal("")),

    tags: z
      .array(z.string().trim().min(1).max(50))
      .max(20, "You can add up to 20 tags.")
      .default([]),

    status: z.enum(NOTE_STATUSES),

    rejectionReason: z
      .string()
      .trim()
      .max(1000, "Rejection reason must be 1000 characters or less.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.status === "REJECTED" && !data.rejectionReason?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["rejectionReason"],
        message: "Rejection reason is required.",
      })
    }
  })

export type UpdateNoteFormValues = z.infer<typeof UpdateNoteSchema>
