import { test, expect } from '@playwright/test'

test.describe('AI Studio Enhanced - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('should display main application title and components', async ({ page }) => {
    // Check main title
    await expect(page.getByRole('heading', { name: /AI Studio Enhanced/i })).toBeVisible()
    
    // Check main components are present
    await expect(page.getByText(/Upload an image/i)).toBeVisible()
    await expect(page.getByRole('textbox', { name: /prompt/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Generate/i })).toBeVisible()
  })

  test('should handle theme switching', async ({ page }) => {
    // Find and click theme toggle buttons
    const lightButton = page.locator('[title*="Light theme"]')
    const darkButton = page.locator('[title*="Dark theme"]')
    
    if (await lightButton.isVisible()) {
      await lightButton.click()
      // Check light theme is applied (html should not have 'dark' class)
      const html = page.locator('html')
      await expect(html).not.toHaveClass(/dark/)
    }
    
    if (await darkButton.isVisible()) {
      await darkButton.click()
      // Check dark theme is applied
      const html = page.locator('html')
      await expect(html).toHaveClass(/dark/)
    }
  })

  test('should handle prompt input and live summary', async ({ page }) => {
    const promptInput = page.getByRole('textbox', { name: /prompt/i })
    
    // Type in prompt
    await promptInput.fill('A beautiful sunset over mountains')
    
    // Check live summary updates
    const liveSummary = page.locator('[aria-live="polite"]').first()
    await expect(liveSummary).toContainText('A beautiful sunset over mountains')
  })

  test('should handle style selection', async ({ page }) => {
    // Click style selector
    const styleButton = page.getByRole('button').filter({ hasText: /Editorial/i })
    await styleButton.click()
    
    // Should show style options
    await expect(page.getByText(/Minimalist/i)).toBeVisible()
    await expect(page.getByText(/Artistic/i)).toBeVisible()
    
    // Select a different style
    await page.getByText(/Vintage/i).first().click()
    
    // Should update live summary
    const liveSummary = page.locator('[aria-live="polite"]').nth(1)
    await expect(liveSummary).toContainText('Vintage')
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test keyboard shortcuts help
    await page.keyboard.press('?')
    await expect(page.getByText(/Keyboard Shortcuts/i)).toBeVisible()
    
    // Close shortcuts modal
    await page.getByRole('button', { name: /close/i }).click()
    
    // Test generate shortcut (should be disabled without image)
    await page.keyboard.press('Control+g')
    // Generate button should still be disabled without image
    const generateButton = page.getByRole('button', { name: /Generate/i })
    await expect(generateButton).toBeDisabled()
  })

  test('should show proper validation for generate button', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /Generate/i })
    
    // Should be disabled initially (no image)
    await expect(generateButton).toBeDisabled()
    
    // Add prompt only - still should be disabled
    await page.getByRole('textbox', { name: /prompt/i }).fill('Test prompt')
    await expect(generateButton).toBeDisabled()
    
    // Note: File upload testing would require more complex setup with actual files
  })

  test('should handle history section', async ({ page }) => {
    // Check history section exists
    await expect(page.getByText(/History \(last 5\)/i)).toBeVisible()
    
    // Should show empty state initially
    await expect(page.getByText(/No generations yet/i)).toBeVisible()
  })

  test('should be keyboard accessible', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Focus should be visible on interactive elements
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Test space/enter on buttons
    const uploadArea = page.getByRole('button', { name: /drag and drop/i })
    await uploadArea.focus()
    await expect(uploadArea).toBeFocused()
  })

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Should still show main components
    await expect(page.getByRole('heading', { name: /AI Studio Enhanced/i })).toBeVisible()
    await expect(page.getByText(/Upload an image/i)).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByRole('button', { name: /Generate/i })).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByText(/History \(last 5\)/i)).toBeVisible()
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Check that error boundary component exists in DOM
    // (This would catch JavaScript errors and show fallback UI)
    
    // Test with invalid actions that might cause errors
    await page.evaluate(() => {
      // Trigger potential errors
      window.localStorage.setItem('ai-studio-history', 'invalid-json')
    })
    
    // Reload page to trigger localStorage parsing
    await page.reload()
    
    // Should still load normally despite corrupted localStorage
    await expect(page.getByRole('heading', { name: /AI Studio Enhanced/i })).toBeVisible()
    await expect(page.getByText(/No generations yet/i)).toBeVisible()
  })
})