import imagekitClient from "@/configs/imagekit"
import { NOTES_IMAGEKIT_FOLDER } from "@/constants/notes.constants"
import { slugify } from "@/utils/slug"
import { toFile } from "@imagekit/nodejs"
import { randomUUID } from "node:crypto"

export interface UploadOptions {
  folder: string
  fileName?: string
}

export interface ImageKitUploadResult {
  url: string
  fileId: string
  size: number
  filePath: string
  title: string
}

export const uploadToImageKit = async (
  buffer: Buffer,
  options: UploadOptions
): Promise<ImageKitUploadResult> => {
  try {
    const fileName = options.fileName || `file-${Date.now()}`
    const file = await toFile(buffer, fileName)

    const result = await imagekitClient.files.upload({
      file: file,
      fileName: fileName,
      folder: options.folder || "/uploads",
    })

    // console.log({ result});

    return {
      url: result.url || "",
      fileId: result.fileId || "",
      size: result.size || 0,
      filePath: result.filePath || "",
      title: options.fileName || "",
    }
  } catch (error) {
    throw error
  }
}

export const deleteFilesFromImageKit = async (
  fileIds: string[]
): Promise<void> => {
  try {
    await Promise.all(
      fileIds.map((fileId) => imagekitClient.files.delete(fileId))
    )
  } catch (error) {
    throw error
  }
}

/**
 * Uploads a note PDF to ImageKit under an organized, per-user folder with
 * a safely generated file name. The original filename is never trusted as
 * a storage key.
 */
export const uploadNotePdf = async (
  buffer: Buffer,
  options: { userId: string; title: string }
): Promise<ImageKitUploadResult> => {
  const safeName = `${slugify(options.title)}-${randomUUID()}.pdf`

  const result = await uploadToImageKit(buffer, {
    folder: NOTES_IMAGEKIT_FOLDER(options.userId),
    fileName: safeName,
  })

  return {
    fileId: result.fileId,
    url: result.url,
    size: result.size,
    filePath: result.filePath,
    title: result.title,
  }
}

/**
 * Cleans up an orphaned ImageKit file (e.g. when the DB insert failed
 * after a successful upload). Failures here are logged, never thrown to
 * the caller — cleanup best-effort should never mask the original error.
 */
export const cleanupOrphanedNoteFile = async (
  fileId: string
): Promise<void> => {
  try {
    await deleteFilesFromImageKit([fileId])
  } catch (error) {
    console.error(
      `[imagekit.service] Failed to clean up orphaned note file ${fileId}:`,
      error
    )
  }
}
