interface DownloadNoteResult {
  success: boolean
  url?: string
  fileName?: string
  message?: string
}

export async function downloadNote(
  noteId: string
): Promise<DownloadNoteResult> {
  try {
    const response = await fetch(`/api/notes/${noteId}/download`, {
      method: "GET",
    })

    if (!response.ok) {
      const data = await response.json()

      return {
        success: false,
        message: data.message || "Unable to download note.",
      }
    }

    return response.url
      ? {
          success: true,
          url: response.url,
        }
      : {
          success: false,
          message: "Unable to download note.",
        }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    }
  }
}
