import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'

// Global test setup
beforeEach(() => {
  // Reset localStorage before each test
  localStorage.clear()
})