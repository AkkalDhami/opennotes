import { z } from "zod"

export const rejectContributionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters so the contributor understands why.")
    .max(1000, "Reason is too long (max 1000 characters)."),
})

export type RejectContributionInput = z.infer<typeof rejectContributionSchema>

export const contributionFiltersSchema = z.object({
  status: z
    .enum(["ALL", "DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "REMOVED"])
    .default("PENDING_REVIEW"),
  search: z.string().trim().optional().default(""),
  subject: z.string().trim().optional().default(""),
  category: z.string().trim().optional().default(""),
  educationLevel: z.string().trim().optional().default(""),
  dateFrom: z.string().trim().optional().default(""),
  dateTo: z.string().trim().optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
})

export type ContributionFiltersInput = z.infer<typeof contributionFiltersSchema>
