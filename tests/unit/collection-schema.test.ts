import { describe, expect, it } from "vitest"

import {
  CreateCollectionSchema,
  UpdateNoteCollectionsSchema,
} from "@/validations/collection"
import { normalizeSlugDraft } from "@/utils/slug"

describe("UpdateNoteCollectionsSchema", () => {
  it("allows an empty selection to remove every membership", () => {
    const result = UpdateNoteCollectionsSchema.safeParse({
      noteId: "11111111-1111-4111-8111-111111111111",
      collectionIds: [],
    })

    expect(result.success).toBe(true)
  })

  it("accepts a selected collection set", () => {
    const result = UpdateNoteCollectionsSchema.safeParse({
      noteId: "11111111-1111-4111-8111-111111111111",
      collectionIds: ["22222222-2222-4222-8222-222222222222"],
    })

    expect(result.success).toBe(true)
  })

  it("rejects invalid collection ids", () => {
    const result = UpdateNoteCollectionsSchema.safeParse({
      noteId: "11111111-1111-4111-8111-111111111111",
      collectionIds: ["not-a-uuid"],
    })

    expect(result.success).toBe(false)
  })
})

describe("CreateCollectionSchema", () => {
  it("accepts a custom slug and trims it", () => {
    const result = CreateCollectionSchema.safeParse({
      name: "Biology Notes",
      description: "Semester 1",
      parentId: null,
      visibility: "PRIVATE",
      slug: "  biology-notes  ",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.slug).toBe("biology-notes")
    }
  })

  it("allows a blank slug for auto-generation", () => {
    const result = CreateCollectionSchema.safeParse({
      name: "Biology Notes",
      slug: "",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.slug).toBe("")
    }
  })

  it("rejects invalid slug characters", () => {
    const result = CreateCollectionSchema.safeParse({
      name: "Biology Notes",
      slug: "Biology Notes!",
    })

    expect(result.success).toBe(false)
  })

  it("keeps a hyphen while the user is typing a slug draft", () => {
    expect(normalizeSlugDraft("biology-notes")).toBe("biology-notes")
    expect(normalizeSlugDraft("biology-")).toBe("biology-")
    expect(normalizeSlugDraft("biology notes")).toBe("biology-notes")
  })
})
