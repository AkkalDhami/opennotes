import { reportReasonEnum, ReportReasonType } from "@/db"
import z from "zod"

export const REPORT_REASON_LABELS: Record<ReportReasonType, string> = {
  COPYRIGHT: "Copyright / ownership issue",
  SPAM: "Spam",
  INCORRECT: "Incorrect information",
  OFFENSIVE: "Offensive content",
  MALWARE: "Malware / suspicious file",
  DUPLICATE: "Duplicate note",
  OTHER: "Other",
}

const EXPLANATION_MAX_LENGTH = 1000
const RESOLUTION_NOTE_MAX_LENGTH = 1000

export const SubmitReportSchema = z.object({
  noteId: z.uuid({ message: "This note could not be identified." }),
  reason: z.enum([...reportReasonEnum.enumValues], {
    message: "Please select a reason for your report.",
  }),
  explanation: z
    .string()
    .trim()
    .max(EXPLANATION_MAX_LENGTH, {
      message: `Please keep the explanation under ${EXPLANATION_MAX_LENGTH} characters.`,
    })
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
})

export type SubmitReportInput = z.input<typeof SubmitReportSchema>

export const ResolveReportSchema = z.object({
  reportId: z.uuid(),
  resolutionNote: z
    .string()
    .trim()
    .min(1, { message: "Please explain what action was taken." })
    .max(RESOLUTION_NOTE_MAX_LENGTH, {
      message: `Please keep the resolution note under ${RESOLUTION_NOTE_MAX_LENGTH} characters.`,
    }),
})

export type ResolveReportInput = z.infer<typeof ResolveReportSchema>

export const DismissReportSchema = z.object({
  reportId: z.uuid(),
  resolutionNote: z
    .string()
    .trim()
    .min(1, { message: "Please explain why this report was dismissed." })
    .max(RESOLUTION_NOTE_MAX_LENGTH, {
      message: `Please keep the note under ${RESOLUTION_NOTE_MAX_LENGTH} characters.`,
    }),
})

export type DismissReportInput = z.infer<typeof DismissReportSchema>
