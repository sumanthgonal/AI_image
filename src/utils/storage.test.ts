import { describe, it, expect, beforeEach } from 'vitest'
import { saveGeneration, loadHistory, type Generation } from './storage'

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const mockGeneration: Generation = {
    id: 'test-id-123',
    imageUrl: 'data:image/jpeg;base64,test',
    prompt: 'Test prompt',
    style: 'Editorial',
    createdAt: '2024-01-15T10:30:45.123Z'
  }

  describe('loadHistory', () => {
    it('returns empty array when no history exists', () => {
      const history = loadHistory()
      expect(history).toEqual([])
    })

    it('returns parsed history from localStorage', () => {
      localStorage.setItem('ai-studio-history', JSON.stringify([mockGeneration]))
      
      const history = loadHistory()
      expect(history).toEqual([mockGeneration])
    })

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem('ai-studio-history', 'invalid-json')
      
      const history = loadHistory()
      expect(history).toEqual([])
    })

    it('handles non-array data in localStorage', () => {
      localStorage.setItem('ai-studio-history', JSON.stringify({ invalid: 'data' }))
      
      const history = loadHistory()
      expect(history).toEqual([])
    })
  })

  describe('saveGeneration', () => {
    it('saves single generation to localStorage', () => {
      saveGeneration(mockGeneration)
      
      const saved = JSON.parse(localStorage.getItem('ai-studio-history') || '[]')
      expect(saved).toEqual([mockGeneration])
    })

    it('maintains chronological order (newest first)', () => {
      const first = { ...mockGeneration, id: 'first', createdAt: '2024-01-15T10:00:00.000Z' }
      const second = { ...mockGeneration, id: 'second', createdAt: '2024-01-15T11:00:00.000Z' }
      
      saveGeneration(first)
      saveGeneration(second)
      
      const history = loadHistory()
      expect(history[0].id).toBe('second')
      expect(history[1].id).toBe('first')
    })

    it('limits history to 5 items maximum', () => {
      // Add 6 generations
      for (let i = 1; i <= 6; i++) {
        saveGeneration({
          ...mockGeneration,
          id: `gen-${i}`,
          createdAt: `2024-01-15T10:${i.toString().padStart(2, '0')}:00.000Z`
        })
      }
      
      const history = loadHistory()
      expect(history).toHaveLength(5)
      expect(history[0].id).toBe('gen-6') // newest first
      expect(history[4].id).toBe('gen-2') // oldest kept
    })

    it('preserves existing history when adding new generation', () => {
      const existing = { ...mockGeneration, id: 'existing' }
      saveGeneration(existing)
      
      const newGen = { ...mockGeneration, id: 'new' }
      saveGeneration(newGen)
      
      const history = loadHistory()
      expect(history).toHaveLength(2)
      expect(history.find(g => g.id === 'existing')).toBeTruthy()
      expect(history.find(g => g.id === 'new')).toBeTruthy()
    })
  })

  describe('integration', () => {
    it('maintains data consistency across save and load operations', () => {
      const generations = [
        { ...mockGeneration, id: '1', prompt: 'First generation' },
        { ...mockGeneration, id: '2', prompt: 'Second generation' },
        { ...mockGeneration, id: '3', prompt: 'Third generation' }
      ]
      
      generations.forEach(saveGeneration)
      
      const loaded = loadHistory()
      expect(loaded).toHaveLength(3)
      expect(loaded[0].prompt).toBe('Third generation') // newest first
      expect(loaded[2].prompt).toBe('First generation') // oldest last
    })
  })
})