import { PDFDocument } from "pdf-lib"

export async function getPdfPageCount(fileUrl: string) {
  const response = await fetch(fileUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()

  const pdf = await PDFDocument.load(arrayBuffer)

  return pdf.getPageCount()
}