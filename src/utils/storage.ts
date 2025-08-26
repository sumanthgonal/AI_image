
export type Generation = {
  id: string
  imageUrl: string
  prompt: string
  style: string
  createdAt: string
}

const KEY = 'ai-studio-history'

export function saveGeneration(gen: Generation) {
  const list = loadHistory()
  const next = [gen, ...list].slice(0, 5)
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function loadHistory(): Generation[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Generation[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
