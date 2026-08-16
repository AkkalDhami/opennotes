const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
]

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

export function formatRelativeTime(date: Date): string {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absSeconds = Math.abs(seconds)

  if (absSeconds < 60) return "just now"

  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (absSeconds >= unitSeconds) {
      const value = Math.round(seconds / unitSeconds)
      return rtf.format(value, unit)
    }
  }

  return rtf.format(Math.round(seconds / 60), "minute")
}

export function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

interface FormatDateOptions {
  dateStyle?: Intl.DateTimeFormatOptions["dateStyle"]
  timeStyle?: Intl.DateTimeFormatOptions["timeStyle"]
}

export function formatDate(
  date: Date,
  { dateStyle = "medium", timeStyle }: FormatDateOptions = {}
): string {
  const formattedDate = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat("en", {
    dateStyle,
    ...(timeStyle && { timeStyle }),
  })?.format(formattedDate)
}
