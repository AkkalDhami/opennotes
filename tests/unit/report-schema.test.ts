import { ResolveReportSchema, SubmitReportSchema } from "@/validations/report"
import { describe, expect, it } from "vitest"

describe("SubmitReportSchema", () => {
  const validNoteId = "123e4567-e89b-12d3-a456-426614174000"

  it("accepts a valid minimal report", () => {
    const result = SubmitReportSchema.safeParse({
      noteId: validNoteId,
      reason: "SPAM",
    })

    expect(result.success).toBe(true)
  })

  it("accepts a valid report with an explanation", () => {
    const result = SubmitReportSchema.safeParse({
      noteId: validNoteId,
      reason: "COPYRIGHT",
      explanation: "This is a scanned copy of a textbook I own the rights to.",
    })

    expect(result.success).toBe(true)
  })

  it("rejects a non-UUID noteId", () => {
    const result = SubmitReportSchema.safeParse({
      noteId: "not-a-uuid",
      reason: "SPAM",
    })

    expect(result.success).toBe(false)
  })

  it("rejects a missing reason", () => {
    const result = SubmitReportSchema.safeParse({
      noteId: validNoteId,
    })

    expect(result.success).toBe(false)
  })

  it("rejects an invalid reason not in the enum", () => {
    const result = SubmitReportSchema.safeParse({
      noteId: validNoteId,
      reason: "NOT_A_REAL_REASON",
    })

    expect(result.success).toBe(false)
  })

  it("rejects an explanation over the max length", () => {
    const result = SubmitReportSchema.safeParse({
      noteId: validNoteId,
      reason: "OTHER",
      explanation: "a".repeat(1001),
    })

    expect(result.success).toBe(false)
  })

  it("accepts an explanation at exactly the max length", () => {
    const result = SubmitReportSchema.safeParse({
      noteId: validNoteId,
      reason: "OTHER",
      explanation: "a".repeat(1000),
    })

    expect(result.success).toBe(true)
  })

  it("trims whitespace and treats an empty explanation as undefined", () => {
    const result = SubmitReportSchema.safeParse({
      noteId: validNoteId,
      reason: "OTHER",
      explanation: "   ",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.explanation).toBeUndefined()
    }
  })
})

describe("resolveReportSchema", () => {
  const validReportId = "123e4567-e89b-12d3-a456-426614174000"

  it("requires a non-empty resolution note", () => {
    const result = ResolveReportSchema.safeParse({
      reportId: validReportId,
      resolutionNote: "",
    })

    expect(result.success).toBe(false)
  })

  it("accepts a valid resolution", () => {
    const result = ResolveReportSchema.safeParse({
      reportId: validReportId,
      resolutionNote: "Verified copyright claim; note removed.",
    })

    expect(result.success).toBe(true)
  })
})
