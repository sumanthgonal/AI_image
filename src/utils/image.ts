
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function downscaleIfNeeded(file: File, maxDim = 1920): Promise<string> {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.src = url
  await img.decode()

  const tooLarge = file.size > 10 * 1024 * 1024 // >10MB
  const exceedsMax = img.width > maxDim || img.height > maxDim
  if (!tooLarge && !exceedsMax) {
    URL.revokeObjectURL(url)
    return fileToDataUrl(file)
  }

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(img.width * scale)
  canvas.height = Math.floor(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(url)

  // Use JPEG to reduce size; quality balance
  return canvas.toDataURL('image/jpeg', 0.9)
}
