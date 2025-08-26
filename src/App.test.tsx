
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from './contexts/ThemeContext'
import App from './App'

describe('App', () => {
  it('renders headings and buttons', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    )
    expect(screen.getByText(/AI Studio Enhanced/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Generate/i })).toBeInTheDocument()
  })
})
