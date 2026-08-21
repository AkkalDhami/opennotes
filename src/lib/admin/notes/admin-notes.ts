"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import {
  db,
  NoteModerationAction,
  noteModerationEvents,
  NoteStatus,
} from "@/db"
import { notes } from "@/db"
import {
  publishNoteSchema,
  rejectNoteSchema,
  removeNoteSchema,
  restoreNoteSchema,
  unpublishNoteSchema,
  PublishNoteInput,
  RejectNoteInput,
  RemoveNoteInput,
  RestoreNoteInput,
  UnpublishNoteInput,
} from "@/validations/admin-notes"
import { requireAdmin } from "@/lib/auth/require-admin"

export interface ActionResult {
  success: boolean
  error?: string
}

/** Statuses each mutation is legal from. Keeps the server the source of truth for valid transitions. */
const VALID_TRANSITIONS: Record<string, NoteStatus[]> = {
  publish: ["PENDING_REVIEW", "REJECTED"],
  reject: ["PENDING_REVIEW"],
  remove: ["PUBLISHED", "PENDING_REVIEW", "REJECTED"],
  restore: ["REMOVED", "REJECTED"],
  unpublish: ["PUBLISHED"],
}

async function loadNoteOrThrow(noteId: string) {
  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, noteId))
    .limit(1)
  if (!note) throw new Error("This note no longer exists.")
  return note
}

function assertTransition(
  action: keyof typeof VALID_TRANSITIONS,
  current: NoteStatus
) {
  if (!VALID_TRANSITIONS[action].includes(current)) {
    throw new Error(
      `This note is currently "${current}" and can't be ${action}ed from that state.`
    )
  }
}

async function logModeration(
  noteId: string,
  adminId: string,
  action: NoteModerationAction,
  reason: string | null
) {
  await db
    .insert(noteModerationEvents)
    .values({ noteId, adminId, action, reason })
}

function toActionResult(fn: () => Promise<void>): Promise<ActionResult> {
  return fn()
    .then(() => ({ success: true }))
    .catch((error: unknown) => ({
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong.",
    }))
}

export async function publishAdminNote(
  input: PublishNoteInput
): Promise<ActionResult> {
  return toActionResult(async () => {
    const { noteId } = publishNoteSchema.parse(input)
    const admin = await requireAdmin()
    const note = await loadNoteOrThrow(noteId)
    assertTransition("publish", note.status)

    await db
      .update(notes)
      .set({
        status: "PUBLISHED",
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notes.id, noteId))
    await logModeration(noteId, admin.id, "PUBLISH", null)

    revalidatePath("/admin/notes")
    revalidatePath(`/notes/${note.slug}`)
  })
}

export async function rejectAdminNote(
  input: RejectNoteInput
): Promise<ActionResult> {
  return toActionResult(async () => {
    const { noteId, reason } = rejectNoteSchema.parse(input)
    const admin = await requireAdmin()
    const note = await loadNoteOrThrow(noteId)
    assertTransition("reject", note.status)

    await db
      .update(notes)
      .set({ status: "REJECTED", updatedAt: new Date() })
      .where(eq(notes.id, noteId))
    await logModeration(noteId, admin.id, "REJECT", reason)

    revalidatePath("/admin/notes")
  })
}

export async function removeAdminNote(
  input: RemoveNoteInput
): Promise<ActionResult> {
  return toActionResult(async () => {
    const { noteId, reason } = removeNoteSchema.parse(input)
    const admin = await requireAdmin()
    const note = await loadNoteOrThrow(noteId)
    assertTransition("remove", note.status)

    await db
      .update(notes)
      .set({ status: "REMOVED", updatedAt: new Date() })
      .where(eq(notes.id, noteId))
    await logModeration(noteId, admin.id, "REMOVE", reason ?? null)

    revalidatePath("/admin/notes")
    revalidatePath(`/notes/${note.slug}`)
  })
}

export async function restoreAdminNote(
  input: RestoreNoteInput
): Promise<ActionResult> {
  return toActionResult(async () => {
    const { noteId } = restoreNoteSchema.parse(input)
    const admin = await requireAdmin()
    const note = await loadNoteOrThrow(noteId)
    assertTransition("restore", note.status)

    // Restoring returns the note to review rather than silently republishing it.
    await db
      .update(notes)
      .set({ status: "PENDING_REVIEW", updatedAt: new Date() })
      .where(eq(notes.id, noteId))
    await logModeration(noteId, admin.id, "RESTORE", null)

    revalidatePath("/admin/notes")
  })
}

export async function unpublishAdminNote(
  input: UnpublishNoteInput
): Promise<ActionResult> {
  return toActionResult(async () => {
    const { noteId, reason } = unpublishNoteSchema.parse(input)
    const admin = await requireAdmin()
    const note = await loadNoteOrThrow(noteId)
    assertTransition("unpublish", note.status)

    await db
      .update(notes)
      .set({ status: "PENDING_REVIEW", updatedAt: new Date() })
      .where(eq(notes.id, noteId))
    await logModeration(noteId, admin.id, "UNPUBLISH", reason ?? null)

    revalidatePath("/admin/notes")
    revalidatePath(`/notes/${note.slug}`)
  })
}
