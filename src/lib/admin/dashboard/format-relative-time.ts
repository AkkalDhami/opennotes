export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.round(diffMs / 1000)

  if (diffSec < 60) return "just now"

  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`

  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`

  const diffDay = Math.round(diffHour / 24)
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
