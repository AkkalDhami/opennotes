import { describe, expect, it } from "vitest"

import { CreateCollectionSchema } from "../../src/validations/collection"
import { normalizeSlugDraft } from "../../src/utils/slug"

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

  it("allows a blank slug to mean auto-generate", () => {
    const result = CreateCollectionSchema.safeParse({
      name: "Biology Notes",
      slug: "",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.slug).toBeUndefined()
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
