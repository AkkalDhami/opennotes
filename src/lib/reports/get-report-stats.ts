import { cache } from "react"
import { count, eq } from "drizzle-orm"

import { db } from "@/db"
import { reports } from "@/db"

export type ReportStats = {
  open: number
  resolved: number
  dismissed: number
  total: number
}

const n = (v: string | number | null | undefined) => Number(v ?? 0)

export const getReportStats = cache(async (): Promise<ReportStats> => {
  const [openRow, resolvedRow, dismissedRow, totalRow] = await Promise.all([
    db
      .select({ value: count() })
      .from(reports)
      .where(eq(reports.status, "OPEN")),
    db
      .select({ value: count() })
      .from(reports)
      .where(eq(reports.status, "RESOLVED")),
    db
      .select({ value: count() })
      .from(reports)
      .where(eq(reports.status, "DISMISSED")),
    db.select({ value: count() }).from(reports),
  ])

  return {
    open: n(openRow[0]?.value),
    resolved: n(resolvedRow[0]?.value),
    dismissed: n(dismissedRow[0]?.value),
    total: n(totalRow[0]?.value),
  }
})
