import { createHash } from "node:crypto"

const VIEWER_HASH_SALT = process.env.VIEWER_HASH_SALT ?? "opennotes-dev-salt"

export function getViewerHash(
  request: Request,
  noteId: string,
  windowBucket: "day" = "day"
): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  const userAgent = request.headers.get("user-agent") ?? "unknown"

  // Bucket by day so the same visitor is deduped within a day but the hash
  // still rotates over time rather than being a permanent fingerprint.
  const bucket =
    windowBucket === "day" ? new Date().toISOString().slice(0, 10) : ""

  return createHash("sha256")
    .update(`${VIEWER_HASH_SALT}:${ip}:${userAgent}:${noteId}:${bucket}`)
    .digest("hex")
}
