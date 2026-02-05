import { describe, it, expect } from 'vitest'
import { fileToDataUrl, downscaleIfNeeded } from './image'

describe('image utilities', () => {
  // Mock File constructor for testing
  const createMockFile = (size: number, type = 'image/jpeg'): File => {
    const buffer = new ArrayBuffer(size)
    return new File([buffer], 'test.jpg', { type })
  }

  // Mock Image for testing
  const createMockImage = (width: number, height: number) => {
    const img = {
      width,
      height,
      src: '',
      decode: () => Promise.resolve(),
      addEventListener: () => {},
      removeEventListener: () => {}
    }
    return img as unknown as HTMLImageElement
  }

  describe('fileToDataUrl', () => {
    it('converts file to data URL', async () => {
      const mockFile = createMockFile(1000)
      
      // Mock FileReader
      const originalFileReader = global.FileReader
      global.FileReader = function(this: any) {
        this.readAsDataURL = (file: File) => {
          setTimeout(() => {
            this.result = 'data:image/jpeg;base64,mock-data'
            this.onload?.()
          }, 0)
        }
      } as any

      const result = await fileToDataUrl(mockFile)
      expect(result).toBe('data:image/jpeg;base64,mock-data')

      global.FileReader = originalFileReader
    })

    it('handles FileReader errors', async () => {
      const mockFile = createMockFile(1000)
      
      const originalFileReader = global.FileReader
      global.FileReader = function(this: any) {
        this.readAsDataURL = () => {
          setTimeout(() => {
            this.onerror?.(new Error('File read error'))
          }, 0)
        }
      } as any

      await expect(fileToDataUrl(mockFile)).rejects.toThrow()

      global.FileReader = originalFileReader
    })
  })

  describe('downscaleIfNeeded', () => {
    it('returns original file as data URL when within limits', async () => {
      const smallFile = createMockFile(5 * 1024 * 1024) // 5MB
      
      // Mock URL and Image
      const originalCreateObjectURL = global.URL.createObjectURL
      const originalRevokeObjectURL = global.URL.revokeObjectURL
      global.URL.createObjectURL = () => 'mock-url'
      global.URL.revokeObjectURL = () => {}

      // Mock Image constructor
      const originalImage = global.Image
      global.Image = function(this: any) {
        return createMockImage(1000, 800) // Within 1920px limit
      } as any

      // Mock FileReader for fileToDataUrl
      const originalFileReader = global.FileReader
      global.FileReader = function(this: any) {
        this.readAsDataURL = () => {
          setTimeout(() => {
            this.result = 'data:image/jpeg;base64,original'
            this.onload?.()
          }, 0)
        }
      } as any

      const result = await downscaleIfNeeded(smallFile, 1920)
      expect(result).toBe('data:image/jpeg;base64,original')

      // Restore globals
      global.URL.createObjectURL = originalCreateObjectURL
      global.URL.revokeObjectURL = originalRevokeObjectURL
      global.Image = originalImage
      global.FileReader = originalFileReader
    })

    it('processes file when size exceeds 10MB', async () => {
      const largeFile = createMockFile(15 * 1024 * 1024) // 15MB
      
      // Setup mocks for downscaling path
      const setupDownscaleMocks = () => {
        global.URL.createObjectURL = () => 'mock-url'
        global.URL.revokeObjectURL = () => {}
        
        global.Image = function(this: any) {
          return createMockImage(1000, 800)
        } as any

        // Mock canvas and context
        global.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,downscaled'
        global.HTMLCanvasElement.prototype.getContext = () => ({
          drawImage: () => {}
        })

        global.document.createElement = (tagName: string) => {
          if (tagName === 'canvas') {
            return {
              width: 0,
              height: 0,
              getContext: () => ({
                drawImage: () => {}
              }),
              toDataURL: () => 'data:image/jpeg;base64,downscaled'
            } as any
          }
          return {} as any
        }
      }

      setupDownscaleMocks()

      const result = await downscaleIfNeeded(largeFile, 1920)
      expect(result).toBe('data:image/jpeg;base64,downscaled')
    })

    it('calculates correct scale factor for oversized images', async () => {
      const normalFile = createMockFile(5 * 1024 * 1024)
      
      global.URL.createObjectURL = () => 'mock-url'
      global.URL.revokeObjectURL = () => {}
      
      // Image larger than 1920px
      global.Image = function(this: any) {
        return createMockImage(3840, 2160) // 4K image
      } as any

      let capturedWidth = 0
      let capturedHeight = 0

      global.document.createElement = (tagName: string) => {
        if (tagName === 'canvas') {
          return {
            set width(w: number) { capturedWidth = w },
            set height(h: number) { capturedHeight = h },
            get width() { return capturedWidth },
            get height() { return capturedHeight },
            getContext: () => ({
              drawImage: () => {}
            }),
            toDataURL: () => 'data:image/jpeg;base64,scaled'
          } as any
        }
        return {} as any
      }

      await downscaleIfNeeded(normalFile, 1920)
      
      // Should scale down to fit within 1920px (scale factor = 1920/3840 = 0.5)
      expect(capturedWidth).toBe(1920) // 3840 * 0.5
      expect(capturedHeight).toBe(1080) // 2160 * 0.5
    })
  })
})