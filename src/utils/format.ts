/** Compact number formatting: 124 -> "124", 1240 -> "1.2K", 12400 -> "12.4K". */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

/** Full number with thousands separators, for tooltips and stat cards. */
export function formatExactNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

/** "Aug 16, 2026" */
export function formatShortDate(iso: string | null): string {
  if (!iso) return "Not published"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso))
}

/** "Aug 16, 2026, 4:32 PM" — used in tooltips for exact timestamps. */
export function formatFullTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB"]
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`
}

export function formatNoteMeta(
  parts: Array<string | null | undefined>,
  removeRepeatedPrefix = true
): string {
  const cleaned = parts.filter((part): part is string => Boolean(part?.trim()))

  return cleaned
    .map((part, index) => {
      if (!removeRepeatedPrefix || index === 0) return part

      const previous = cleaned[index - 1]
      const prefix = `${previous} `

      if (previous && part.startsWith(prefix)) {
        return part.slice(prefix.length)
      }

      return part
    })
    .join(" · ")
}
