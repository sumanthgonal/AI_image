
import { Generation } from './storage'

export type GenerateBody = {
  imageDataUrl: string
  prompt: string
  style: string
}

export function mockGenerate(
  body: GenerateBody,
  opts?: { signal?: AbortSignal },
): Promise<Generation> {
  return new Promise((resolve, reject) => {
    const delay = 1000 + Math.floor(Math.random() * 1000) // 1–2s
    const id = crypto.randomUUID()
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    opts?.signal?.addEventListener('abort', onAbort, { once: true })

    const timer = setTimeout(() => {
      opts?.signal?.removeEventListener('abort', onAbort)
      // 20% error rate
      if (Math.random() < 0.2) {
        reject({ message: 'Model overloaded' })
        return
      }
      // Echo back the provided image and data
      const gen: Generation = {
        id,
        imageUrl: body.imageDataUrl,
        prompt: body.prompt,
        style: body.style,
        createdAt: new Date().toISOString(),
      }
      resolve(gen)
    }, delay)
  })
}

export async function withRetries<T>(
  fn: (attempt: number, signal: AbortSignal) => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 500,
  controller?: AbortController,
): Promise<T> {
  let lastErr: unknown
  const ac = controller ?? new AbortController()
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt, ac.signal)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') throw err
      lastErr = err
      if (attempt >= maxAttempts) break
      const backoff = baseDelayMs * 2 ** (attempt - 1)
      await new Promise((r, rej) => {
        const t = setTimeout(r, backoff)
        ac.signal.addEventListener('abort', () => {
          clearTimeout(t)
          rej(new DOMException('Aborted', 'AbortError'))
        }, { once: true })
      })
    }
  }
  throw lastErr
}
