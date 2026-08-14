import "server-only"
import { NoteStatus } from "@/db/schemas/note.schema"

/**
 * The single source of truth for which status transitions are allowed.
 * Every mutating server action checks against this before writing to the
 * database — this is what prevents e.g. a DRAFT note from being approved,
 * or a PUBLISHED note from being "approved" again.
 */
export const VALID_STATUS_TRANSITIONS: Record<NoteStatus, NoteStatus[]> = {
  DRAFT: [],
  PENDING_REVIEW: ["PUBLISHED", "REJECTED"],
  PUBLISHED: ["REMOVED"],
  REJECTED: ["PUBLISHED"],
  REMOVED: ["PUBLISHED"],
}

export function canTransition(from: NoteStatus, to: NoteStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

/**
 * Paths revalidated after any moderation mutation. Adjust the public-facing
 * paths to match your actual public note listing / search / contributor
 * routes — these are best-guess names based on your spec ("/contributors"
 * was explicitly named; the notes listing path wasn't, so confirm it).
 */
export function getRevalidatePaths(noteId: string): string[] {
  return [
    "/admin/contributions",
    `/admin/contributions/${noteId}`,
    "/contributors",
    "/notes", // TODO: confirm this is your actual public notes listing route
  ]
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string }
