import { z } from "zod"
import { PAGE_SIZE_OPTIONS, SORT_OPTIONS } from "@/types/note"
import { noteSourceTypeEnum, noteStatusEnum, processingStatusEnum } from "@/db"

export const adminNotesFiltersSchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(noteStatusEnum.enumValues).optional(),
  subject: z.string().trim().max(100).optional(),
  educationLevel: z.string().trim().max(100).optional(),
  sourceType: z.enum(noteSourceTypeEnum.enumValues).optional(),
  processingStatus: z.enum(processingStatusEnum.enumValues).optional(),
  sort: z.enum(SORT_OPTIONS).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((n) => (PAGE_SIZE_OPTIONS as readonly number[]).includes(n), {
      message: "pageSize must be 20, 50, or 100",
    })
    .default(20),
})

export type AdminNotesFiltersInput = z.infer<typeof adminNotesFiltersSchema>

const noteIdSchema = z.object({
  noteId: z.string().uuid("Invalid note id"),
})

export const publishNoteSchema = noteIdSchema

export const unpublishNoteSchema = noteIdSchema.extend({
  reason: z.string().trim().max(500).optional(),
})

export const rejectNoteSchema = noteIdSchema.extend({
  reason: z
    .string()
    .trim()
    .min(10, "Give the contributor at least a short explanation.")
    .max(1000, "Keep the reason under 1000 characters."),
})

export const removeNoteSchema = noteIdSchema.extend({
  reason: z.string().trim().max(500).optional(),
})

export const restoreNoteSchema = noteIdSchema

export type PublishNoteInput = z.infer<typeof publishNoteSchema>
export type UnpublishNoteInput = z.infer<typeof unpublishNoteSchema>
export type RejectNoteInput = z.infer<typeof rejectNoteSchema>
export type RemoveNoteInput = z.infer<typeof removeNoteSchema>
export type RestoreNoteInput = z.infer<typeof restoreNoteSchema>
