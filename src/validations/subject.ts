import { z } from "zod"

export const subjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters.")
    .max(128, "Subject name cannot exceed 128 characters."),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug must be at least 2 characters.")
    .max(128, "Slug cannot exceed 128 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens."
    ),
})

export type SubjectFormValues = z.infer<typeof subjectSchema>

// Used by the edit dialog — same shape, plus the id being edited.
export const updateSubjectSchema = subjectSchema.extend({
  id: z.string().uuid(),
})

export type UpdateSubjectFormValues = z.infer<typeof updateSubjectSchema>

// Query-param validation for the index/listing (search, pagination, sort).
export const SORT_OPTIONS = [
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
] as const

export type SubjectSort = (typeof SORT_OPTIONS)[number]

export const subjectsQuerySchema = z.object({
  search: z.string().trim().max(128).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.enum(SORT_OPTIONS).optional().default("newest"),
})

export type SubjectsQuery = z.infer<typeof subjectsQuerySchema>

// Helper used by the Add/Edit dialog to auto-generate a slug from the name.
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128)
}
