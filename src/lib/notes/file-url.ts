import "server-only"
import imagekitClient from "@/configs/imagekit"

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
