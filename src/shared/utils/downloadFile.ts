/**
 * Utility function to trigger file download in browser
 */
export function downloadFile(content: string | ArrayBuffer, filename: string, mimeType: string): void {
  // Create blob from content
  const blob = new Blob([content], { type: mimeType })

  // Create download link
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename

  // Trigger download
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
