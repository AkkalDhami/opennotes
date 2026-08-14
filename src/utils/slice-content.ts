export function sliceContent(content: string, limit: number = 32) {
  return content.length > limit ? `${content.slice(0, limit)}...` : content
}