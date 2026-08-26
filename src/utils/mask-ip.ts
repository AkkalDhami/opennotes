export function describeIpForDisplay(
  ip: string | null | undefined
): string | null {
  if (!ip) return null

  // Local/dev addresses aren't meaningful to show a user.
  if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return null

  const lastOctetMatch = ip.match(/(\d{1,3})$/)
  if (lastOctetMatch) return `IP ending in ${lastOctetMatch[1]}`

  return null
}
