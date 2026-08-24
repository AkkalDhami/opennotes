import { COLLECTION_VISIBLITY } from "@/db"
import { z } from "zod"

export const CollectionNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(120, "Name must be under 120 characters")

export const CollectionDescriptionSchema = z
  .string()
  .trim()
  .max(300, "Description must be under 300 characters")
  .optional()
  .or(z.literal(""))

export const CreateCollectionSchema = z.object({
  name: CollectionNameSchema,
  description: CollectionDescriptionSchema,
  parentId: z.uuid().or(z.literal("none")).nullable().optional(),
  visibility: z.enum(COLLECTION_VISIBLITY).default("PRIVATE").optional(),
})
export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>

export const UpdateCollectionSchema = z.object({
  id: z.uuid(),
  name: CollectionNameSchema,
  description: CollectionDescriptionSchema,
  visibility: z.enum(COLLECTION_VISIBLITY).optional(),
})
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>

export const DeleteCollectionSchema = z.object({
  id: z.uuid(),
})

export const CreateSubcollectionSchema = z.object({
  parentId: z.uuid(),
  name: CollectionNameSchema,
  description: CollectionDescriptionSchema,
})
export type CreateSubcollectionInput = z.infer<typeof CreateSubcollectionSchema>

export const AddNotesToCollectionSchema = z.object({
  collectionId: z.uuid(),
  noteIds: z.array(z.uuid()).min(1, "Select at least one note"),
})

export const RemoveNoteFromCollectionSchema = z.object({
  collectionId: z.uuid(),
  noteId: z.uuid(),
})

export const ReorderCollectionsSchema = z.object({
  parentId: z.uuid().nullable(),
  orderedIds: z.array(z.uuid()).min(1),
})

export const MoveCollectionSchema = z.object({
  id: z.uuid(),
  direction: z.enum(["up", "down"]),
})

export const SaveCollectionSchema = z.object({
  collectionId: z.uuid(),
})

export const CollectionsSortSchema = z
  .enum(["updated", "created", "name_asc", "name_desc"])
  .default("updated")
export type CollectionsSort = z.infer<typeof CollectionsSortSchema>

export const AddNoteToCollectionsSchema = z.object({
  noteId: z.uuid(),
  collectionIds: z.array(z.uuid()).min(1, "Select at least one collection"),
})
export type AddNoteToCollectionsInput = z.infer<
  typeof AddNoteToCollectionsSchema
>

export const CollectionPickerDataSchema = z.object({
  noteId: z.uuid(),
})
