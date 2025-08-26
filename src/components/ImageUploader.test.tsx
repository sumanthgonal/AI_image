import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '../contexts/ThemeContext'
import ImageUploader from './ImageUploader'

describe('ImageUploader', () => {
  const mockOnChange = () => {}
  const mockOnProcessingChange = () => {}

  const renderImageUploader = () => {
    return render(
      <ThemeProvider>
        <ImageUploader
          value={null}
          onChange={mockOnChange}
          onProcessingChange={mockOnProcessingChange}
        />
      </ThemeProvider>
    )
  }

  it('renders upload area with drag and drop functionality', () => {
    renderImageUploader()
    
    expect(screen.getByText(/Upload an image/i)).toBeInTheDocument()
    expect(screen.getByText(/Drag and drop or click to select/i)).toBeInTheDocument()
    expect(screen.getByText(/PNG, JPG up to 10MB/i)).toBeInTheDocument()
  })

  it('shows preview when image is provided', () => {
    render(
      <ThemeProvider>
        <ImageUploader
          value="data:image/jpeg;base64,test"
          onChange={mockOnChange}
          onProcessingChange={mockOnProcessingChange}
        />
      </ThemeProvider>
    )
    
    const img = screen.getByRole('img', { name: /preview/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,test')
  })

  it('has proper accessibility attributes', () => {
    renderImageUploader()
    
    const uploadArea = screen.getByRole('button')
    expect(uploadArea).toHaveAttribute('aria-label', 'Click to upload or drag and drop an image')
    expect(uploadArea).toHaveAttribute('tabIndex', '0')
  })
})