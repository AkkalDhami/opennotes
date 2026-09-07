"use server"

import { and, eq, inArray } from "drizzle-orm"
import { db } from "@/db"
import { notes, noteModerationEvents } from "@/db/"
import { users } from "@/db/"
import { syncContributorAchievements } from "@/lib/contributors/sync"

export class NoteNotFoundError extends Error {
  constructor(noteId: string) {
    super(`Note ${noteId} not found`)
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Not authorized to perform this action") {
    super(message)
  }
}

async function assertIsAdmin(adminId: string) {
  const [admin] = await db.select().from(users).where(eq(users.id, adminId))
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "MODERATOR")) {
    throw new ForbiddenError()
  }
}

export async function publishNote(
  noteId: string,
  adminId: string,
  reason?: string
) {
  await assertIsAdmin(adminId)

  const { updatedNote, alreadyPublished } = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(notes)
      .set({ status: "PUBLISHED", publishedAt: new Date() })
      .where(
        and(
          eq(notes.id, noteId),
          inArray(notes.status, ["PENDING_REVIEW", "REJECTED"])
        )
      )
      .returning()

    if (updated) {
      await tx.insert(noteModerationEvents).values({
        noteId,
        action: "PUBLISH",
        adminId,
        reason,
      })
      return { updatedNote: updated, alreadyPublished: false }
    }

    const [existing] = await tx.select().from(notes).where(eq(notes.id, noteId))
    if (!existing) throw new NoteNotFoundError(noteId)
    return {
      updatedNote: existing,
      alreadyPublished: existing.status === "PUBLISHED",
    }
  })

  // Recompute even on a no-op transition: harmless (idempotent) and cheap
  // insurance against the contributor achievements ever drifting from the
  // note table's actual state.
  await syncContributorAchievements(updatedNote.contributorId)

  return { note: updatedNote, alreadyPublished }
}

/**
 * PUBLISHED -> REMOVED.
 * The note immediately stops counting toward the contributor's score,
 * tier, rank, and badges because those are always computed from currently-
 * PUBLISHED notes — no explicit "subtract points" step is needed.
 */
export async function removeNote(
  noteId: string,
  adminId: string,
  reason?: string
) {
  await assertIsAdmin(adminId)

  const { updatedNote } = await db.transaction(async (tx) => {
    const updated = await transitionNoteStatusTx(
      tx,
      noteId,
      ["PUBLISHED"],
      "REMOVED"
    )

    if (updated) {
      await tx.insert(noteModerationEvents).values({
        noteId,
        action: "REMOVE",
        adminId,
        reason,
      })
      return { updatedNote: updated }
    }

    const [existing] = await tx.select().from(notes).where(eq(notes.id, noteId))
    if (!existing) throw new NoteNotFoundError(noteId)
    return { updatedNote: existing }
  })

  await syncContributorAchievements(updatedNote.contributorId)

  return { note: updatedNote }
}

/**
 * REMOVED -> PUBLISHED.
 * Deliberately a distinct action from `publishNote` (uses moderation action
 * "RESTORE" rather than "PUBLISH") so the audit trail can tell a first
 * publication apart from a republish, per §8 — even though both funnel
 * into the same idempotent contributor sync afterward.
 */
export async function republishNote(
  noteId: string,
  adminId: string,
  reason?: string
) {
  await assertIsAdmin(adminId)

  const { updatedNote } = await db.transaction(async (tx) => {
    const updated = await transitionNoteStatusTx(
      tx,
      noteId,
      ["REMOVED"],
      "PUBLISHED"
    )

    if (updated) {
      await tx.insert(noteModerationEvents).values({
        noteId,
        action: "RESTORE",
        adminId,
        reason,
      })
      return { updatedNote: updated }
    }

    const [existing] = await tx.select().from(notes).where(eq(notes.id, noteId))
    if (!existing) throw new NoteNotFoundError(noteId)
    return { updatedNote: existing }
  })

  await syncContributorAchievements(updatedNote.contributorId)

  return { note: updatedNote }
}

/**
 * Guarded status transition: only updates the note if it is currently in
 * one of `fromStatuses`, returning the updated row (or `undefined` if the
 * note had already moved past that transition). This `WHERE status IN (...)`
 * guard is what makes publish/remove/restore safe against double-clicks,
 * refreshes, and retried requests (§9) — a repeat call simply matches zero
 * rows and updates nothing, so no duplicate moderation event is written and
 * no duplicate score is ever implied.
 */
async function transitionNoteStatusTx(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  noteId: string,
  fromStatuses: (typeof notes.$inferSelect)["status"][],
  toStatus: (typeof notes.$inferSelect)["status"]
) {
  const [updated] = await tx
    .update(notes)
    .set({
      status: toStatus,
      ...(toStatus === "PUBLISHED" ? { publishedAt: new Date() } : {}),
    })
    .where(and(eq(notes.id, noteId), inArray(notes.status, fromStatuses)))
    .returning()

  return updated
}
