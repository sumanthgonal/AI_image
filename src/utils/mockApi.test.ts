import { describe, it, expect } from 'vitest'
import { mockGenerate, withRetries } from './mockApi'

describe('mockApi', () => {
  describe('mockGenerate', () => {
    it('returns generation with correct format after 1-2 seconds', async () => {
      const start = Date.now()
      const result = await mockGenerate({
        imageDataUrl: 'data:image/jpeg;base64,test',
        prompt: 'test prompt',
        style: 'Editorial'
      })
      const elapsed = Date.now() - start
      
      // Should take 1-2 seconds
      expect(elapsed).toBeGreaterThan(900)
      expect(elapsed).toBeLessThan(2100)
      
      // Check response format
      expect(result.id).toBeTruthy()
      expect(result.imageUrl).toBe('data:image/jpeg;base64,test')
      expect(result.prompt).toBe('test prompt')
      expect(result.style).toBe('Editorial')
      expect(result.createdAt).toBeTruthy()
      
      // Verify createdAt is valid ISO string
      expect(new Date(result.createdAt).toISOString()).toBe(result.createdAt)
    })

    it('respects abort signal', async () => {
      const controller = new AbortController()
      const promise = mockGenerate({
        imageDataUrl: 'data:image/jpeg;base64,test',
        prompt: 'test prompt',
        style: 'Editorial'
      }, { signal: controller.signal })
      
      // Abort immediately
      controller.abort()
      
      await expect(promise).rejects.toThrow('Aborted')
    })

    it('has approximately 20% error rate over many attempts', async () => {
      const attempts = 50
      let errors = 0
      
      const promises = Array.from({ length: attempts }, () =>
        mockGenerate({
          imageDataUrl: 'data:image/jpeg;base64,test',
          prompt: 'test prompt',
          style: 'Editorial'
        }).catch(() => {
          errors++
        })
      )
      
      await Promise.all(promises)
      
      // Should be roughly 20% error rate (allow some variance)
      expect(errors).toBeGreaterThan(5) // at least 10%
      expect(errors).toBeLessThan(25)   // at most 50%
    })
  })

  describe('withRetries', () => {
    it('retries with exponential backoff on failure', async () => {
      let callCount = 0
      const mockFn = async () => {
        callCount++
        if (callCount < 3) {
          throw new Error(`fail ${callCount}`)
        }
        return 'success'
      }

      const start = Date.now()
      const result = await withRetries(mockFn, 3, 100)
      const elapsed = Date.now() - start

      expect(callCount).toBe(3)
      expect(result).toBe('success')
      
      // Should have delays: 100ms + 200ms = ~300ms minimum
      expect(elapsed).toBeGreaterThan(250)
    })

    it('throws last error after max attempts', async () => {
      const mockFn = async () => {
        throw new Error('persistent error')
      }

      await expect(withRetries(mockFn, 3, 50)).rejects.toThrow('persistent error')
    })

    it('respects abort signal during retry delays', async () => {
      const controller = new AbortController()
      const mockFn = async () => {
        throw new Error('fail')
      }

      const promise = withRetries(mockFn, 3, 1000, controller)
      
      // Abort during first retry delay
      setTimeout(() => controller.abort(), 100)

      await expect(promise).rejects.toThrow('Aborted')
    })
  })
})