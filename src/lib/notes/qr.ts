export async function generateNoteQrDataUrl(url: string): Promise<string> {
  const QRCode = (await import("qrcode")).default
  return QRCode.toDataURL(url, {
    width: 1024,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  })
}

/**
 * A QR code with a wrapped title and a single subtitle line rendered beneath
 * it, as a PNG data URL. Browser-only — it rasterizes through a canvas.
 */
export async function generateQrWithCaptionDataUrl({
  url,
  title,
  subtitle,
}: {
  url: string
  title: string
  subtitle?: string | null
}): Promise<string> {
  const qrDataUrl = await generateNoteQrDataUrl(url)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const padding = 40
      const textBlockHeight = 180
      canvas.width = img.width + padding * 2
      canvas.height = img.height + padding * 2 + textBlockHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Failed to get canvas context"))
        return
      }

      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.drawImage(img, padding, padding)

      ctx.fillStyle = "#000000"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"

      const centerX = canvas.width / 2
      const maxTextWidth = canvas.width - padding * 2
      let y = padding + img.height + 24

      ctx.font = "bold 36px sans-serif"
      const words = title.split(" ")
      let line = ""
      const lineHeight = 44

      for (const word of words) {
        const testLine = line + (line ? " " : "") + word
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxTextWidth && line) {
          ctx.fillText(line, centerX, y)
          line = word
          y += lineHeight
        } else {
          line = testLine
        }
      }
      if (line) {
        ctx.fillText(line, centerX, y)
        y += lineHeight + 12
      }

      ctx.font = "28px sans-serif"
      if (subtitle) ctx.fillText(subtitle, centerX, y)

      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = () => reject(new Error("Failed to load QR image"))
    img.src = qrDataUrl
  })
}

export async function generateNoteQrCompositeDataUrl({
  url,
  title,
  subject,
  course,
  grade,
}: {
  url: string
  title: string
  subject: string
  course: string
  grade?: string | null
}): Promise<string> {
  return generateQrWithCaptionDataUrl({
    url,
    title,
    subtitle: `${subject} · ${course}${grade ? ` · ${grade}` : ""}`,
  })
}
