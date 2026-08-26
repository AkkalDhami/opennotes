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

/**
 * Re-parenting ("Move to…"). `parentId: null` means "move to the top level".
 * The cycle guard (a collection can't become its own descendant's child) lives
 * in the action, since it needs to read the tree.
 */
export const MoveCollectionToParentSchema = z.object({
  id: z.uuid(),
  parentId: z.uuid().nullable(),
})
export type MoveCollectionToParentInput = z.infer<
  typeof MoveCollectionToParentSchema
>

export const DuplicateCollectionSchema = z.object({
  id: z.uuid(),
  /** Copy `collection_notes` memberships too. Structure-only copy when false. */
  includeNotes: z.boolean().default(true),
})
export type DuplicateCollectionInput = z.input<typeof DuplicateCollectionSchema>

export const CollectionMoveTargetsSchema = z.object({
  collectionId: z.uuid(),
})

/** Input for the details dialog's per-id overview fetch. */
export const CollectionOverviewSchema = z.object({
  collectionId: z.uuid(),
  noteLimit: z.number().int().min(1).max(24).optional(),
})

export const SaveCollectionSchema = z.object({
  collectionId: z.uuid(),
})

/**
 * "position" is the owner's own drag-and-drop order and is the default — any
 * other sort overrides it for display only, and disables dragging (you can't
 * meaningfully drop into a list that isn't showing the stored order).
 */
export const CollectionsSortSchema = z
  .enum(["position", "updated", "created", "name_asc", "name_desc"])
  .default("position")
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
