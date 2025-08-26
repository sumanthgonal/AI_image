import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../contexts/ThemeContext'
import PromptForm from './PromptForm'

describe('PromptForm', () => {
  const defaultProps = {
    prompt: '',
    style: 'Editorial',
    onPrompt: () => {},
    onStyle: () => {}
  }

  const renderPromptForm = (props = {}) => {
    return render(
      <ThemeProvider>
        <PromptForm {...defaultProps} {...props} />
      </ThemeProvider>
    )
  }

  it('renders prompt textarea and style selector', () => {
    renderPromptForm()
    
    expect(screen.getByRole('textbox', { name: /prompt/i })).toBeInTheDocument()
    expect(screen.getByText(/Editorial/i)).toBeInTheDocument()
  })

  it('displays current prompt and style values', () => {
    renderPromptForm({
      prompt: 'Test prompt',
      style: 'Streetwear'
    })
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeTruthy()
    expect(screen.getByText(/Streetwear/i)).toBeInTheDocument()
  })

  it('shows style dropdown when clicked', () => {
    renderPromptForm()
    
    const styleButton = screen.getByRole('button')
    fireEvent.click(styleButton)
    
    expect(screen.getByText(/Minimalist/i)).toBeInTheDocument()
    expect(screen.getByText(/Artistic/i)).toBeInTheDocument()
  })

  it('allows searching through styles', () => {
    renderPromptForm()
    
    const styleButton = screen.getByRole('button')
    fireEvent.click(styleButton)
    
    const searchInput = screen.getByPlaceholderText(/search styles/i)
    fireEvent.change(searchInput, { target: { value: 'cyber' } })
    
    expect(screen.getByText(/Cyberpunk/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderPromptForm()
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-describedby')
    
    const styleButton = screen.getByRole('button')
    expect(styleButton).toHaveAttribute('aria-expanded', 'false')
  })
})