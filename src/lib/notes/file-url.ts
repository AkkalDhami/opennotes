import "server-only"
import imagekitClient from "@/configs/imagekit"

/**
 * Resolves an ImageKit fileId (as stored in notes.fileKey) to a fetchable
 * URL. This always runs on the server and reuses the existing configured
 * ImageKit client — it never exposes ImageKit credentials to the client,
 * and never creates a second ImageKit client instance.
 *
 * NOTE: verify `imagekitClient.files.get` matches the method name in your
 * installed @imagekit/nodejs version (imagekit.service.ts already uses
 * `.files.upload` / `.files.delete` on the same client, so `.files.get`
 * follows that pattern — but confirm against your SDK version's types).
 */
export async function resolveNoteFileUrl(
  fileId: string
): Promise<string | null> {
  try {
    const file = await imagekitClient.files.get(fileId)
    return file?.url ?? null
  } catch (error) {
    console.error(
      `[file-url] Failed to resolve ImageKit file "${fileId}":`,
      error
    )
    return null
  }
}
