import { describe, it } from "vitest"

describe("submitNoteReport", () => {
  it.todo("creates a report for an anonymous visitor with reporterId = null")

  it.todo("creates a report for an authenticated user with reporterId set")

  it.todo("stores a hashed IP for anonymous reports, never the raw IP")

  it.todo("does not store an IP hash for authenticated reports")

  it.todo("rejects a report for a note that does not exist")

  it.todo("rejects a report for a note that is not PUBLISHED (e.g. DRAFT)")

  it.todo(
    "rejects a duplicate report from the same authenticated user for the same note"
  )

  it.todo(
    "does NOT rely on reporterId sent by the client — identity is server-derived"
  )

  it.todo("rate-limits anonymous submissions after the configured max is hit")

  it.todo("returns INVALID_INPUT with fieldErrors for a missing reason")

  it.todo("never leaks a raw database error message in the returned result")
})

describe("resolveReport / dismissReport", () => {
  it.todo("rejects a USER-role caller (requires MODERATOR or ADMIN)")

  it.todo(
    "stores reviewedBy as the calling admin's id, not any client-supplied value"
  )

  it.todo("stores reviewedAt as a server-generated timestamp")

  it.todo("requires a non-empty resolutionNote")

  it.todo("does not change the reported note's status as a side effect")
})
