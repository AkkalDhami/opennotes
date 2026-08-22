"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db, reports } from "@/db"
import { hashReporterIp } from "@/lib/reports/hash-reporter-ip"
import {
  DismissReportSchema,
  ResolveReportSchema,
  SubmitReportInput,
  SubmitReportSchema,
} from "@/validations/report"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import {
  checkRateLimit,
  getClientIPFromHeaders,
} from "@/lib/custom-rate-limiter"
import { getReportableNote } from "@/lib/notes/get-reportable-note"
import { requireAdmin } from "@/lib/auth/require-admin"

export type ReportActionResult =
  | { success: true; message: string }
  | {
      success: false
      code:
        | "INVALID_INPUT"
        | "NOTE_NOT_FOUND"
        | "NOTE_NOT_REPORTABLE"
        | "REPORT_NOT_FOUND"
        | "ALREADY_REPORTED"
        | "RATE_LIMITED"
        | "UNAUTHORIZED_ACTION"
        | "SERVER_ERROR"
      message: string
      fieldErrors?: Partial<Record<keyof SubmitReportInput, string>>
    }

const ANONYMOUS_REPORT_RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
}

const AUTHENTICATED_REPORT_RATE_LIMIT = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
}

export async function submitNoteReport(
  input: unknown
): Promise<ReportActionResult> {
  const parsed = SubmitReportSchema.safeParse(input)

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof SubmitReportInput, string>> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof SubmitReportInput] = issue.message
      }
    }
    return {
      success: false,
      code: "INVALID_INPUT",
      message: "Please check the report form and try again.",
      fieldErrors,
    }
  }

  const { noteId, reason, explanation } = parsed.data

  try {
    // 1. Identify the reporter server-side. The client never controls this.
    const currentUser = await getCurrentUser()

    // 2. Rate limit before touching the database.
    const headersList = await headers()
    const clientIp = getClientIPFromHeaders(headersList)
    const rateLimitKey = currentUser
      ? `report:user:${currentUser.id}`
      : `report:ip:${clientIp}`
    const rateLimitConfig = currentUser
      ? AUTHENTICATED_REPORT_RATE_LIMIT
      : ANONYMOUS_REPORT_RATE_LIMIT

    const rateLimit = checkRateLimit(rateLimitKey, rateLimitConfig)

    if (!rateLimit.allowed) {
      return {
        success: false,
        code: "RATE_LIMITED",
        message:
          "You're submitting reports too quickly. Please try again later.",
      }
    }

    // 3. Verify the note exists and is in a publicly reportable state.
    // Never trust that a client-submitted noteId refers to a real,
    // published note.
    const note = await getReportableNote(noteId)

    if (!note) {
      return {
        success: false,
        code: "NOTE_NOT_FOUND",
        message: "This note could not be found.",
      }
    }

    if (note.status !== "PUBLISHED") {
      return {
        success: false,
        code: "NOTE_NOT_REPORTABLE",
        message: "This note isn't available to report right now.",
      }
    }

    // 4. Duplicate check for authenticated users. This is a friendly
    // pre-check, not the actual guarantee — the DB's unique index on
    // (reporterId, noteId) is what actually prevents the race between
    // this check and the insert below.
    if (currentUser) {
      const [existingReport] = await db
        .select({ id: reports.id })
        .from(reports)
        .where(
          and(
            eq(reports.noteId, noteId),
            eq(reports.reporterId, currentUser.id)
          )
        )
        .limit(1)

      if (existingReport) {
        return {
          success: false,
          code: "ALREADY_REPORTED",
          message: "You've already reported this note.",
        }
      }
    }

    // 5. Insert. Anonymous reports carry a hashed IP for abuse tracking;
    // authenticated reports rely on the unique index instead and don't
    // need one.
    await db.insert(reports).values({
      noteId,
      reporterId: currentUser?.id ?? null,
      reason,
      explanation: explanation ?? null,
      reporterIpHash: currentUser ? null : hashReporterIp(clientIp),
    })

    revalidatePath("/admin/reports")

    return {
      success: true,
      message:
        "Thank you for helping keep OpenNotes trustworthy. Our team will review your report.",
    }
  } catch (error) {
    // Backstop for the race between the duplicate check and the insert:
    // two concurrent submissions from the same authenticated user both
    // pass the SELECT check, then one hits the unique index on insert.
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        code: "ALREADY_REPORTED",
        message: "You've already reported this note.",
      }
    }

    console.error("[reports] failed to submit report", error)
    return {
      success: false,
      code: "SERVER_ERROR",
      message: "We couldn't submit your report. Please try again.",
    }
  }
}

/**
 * Moderator/admin-only. Marks a report RESOLVED with a required
 * resolution note. Deliberately does NOT touch the reported note's status
 * — resolving a report and acting on the note are separate decisions (see
 * the spec's point about not auto-removing notes on resolution).
 */
export async function resolveReport(
  input: unknown
): Promise<ReportActionResult> {
  const parsed = ResolveReportSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: parsed.error.issues[0]?.message ?? "Please check your input.",
    }
  }

  const admin = await requireAdmin()

  try {
    const updated = await db
      .update(reports)
      .set({
        status: "RESOLVED",
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        resolutionNote: parsed.data.resolutionNote,
      })
      .where(eq(reports.id, parsed.data.reportId))
      .returning({ id: reports.id })

    if (updated.length === 0) {
      return {
        success: false,
        code: "REPORT_NOT_FOUND",
        message: "This report could not be found.",
      }
    }

    revalidatePath("/admin/reports")
    revalidatePath(`/admin/reports/${parsed.data.reportId}`)

    return { success: true, message: "Report resolved." }
  } catch (error) {
    console.error("[reports] failed to resolve report", error)
    return {
      success: false,
      code: "SERVER_ERROR",
      message: "We couldn't update this report. Please try again.",
    }
  }
}

/**
 * Moderator/admin-only. Marks a report DISMISSED with a required note
 * explaining why.
 */
export async function dismissReport(
  input: unknown
): Promise<ReportActionResult> {
  const parsed = DismissReportSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: parsed.error.issues[0]?.message ?? "Please check your input.",
    }
  }

  const admin = await requireAdmin()

  try {
    const updated = await db
      .update(reports)
      .set({
        status: "DISMISSED",
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        resolutionNote: parsed.data.resolutionNote,
      })
      .where(eq(reports.id, parsed.data.reportId))
      .returning({ id: reports.id })

    if (updated.length === 0) {
      return {
        success: false,
        code: "REPORT_NOT_FOUND",
        message: "This report could not be found.",
      }
    }

    revalidatePath("/admin/reports")
    revalidatePath(`/admin/reports/${parsed.data.reportId}`)

    return { success: true, message: "Report dismissed." }
  } catch (error) {
    console.error("[reports] failed to dismiss report", error)
    return {
      success: false,
      code: "SERVER_ERROR",
      message: "We couldn't update this report. Please try again.",
    }
  }
}

// ⚠️ ADJUST: matches node-postgres (`pg`)'s unique_violation code as
// surfaced by Drizzle. If this project uses a different Postgres driver
// that wraps errors differently, adjust this check accordingly.
function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  )
}
