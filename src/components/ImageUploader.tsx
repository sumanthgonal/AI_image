
import { useId, useState, useCallback, DragEvent } from 'react'
import { Upload, X } from 'lucide-react'
import { downscaleIfNeeded } from '../utils/image'
import toast from 'react-hot-toast'

type Props = {
  value: string | null
  onChange: (dataUrl: string | null) => void
  isProcessing?: boolean
  onProcessingChange?: (processing: boolean) => void
}

export default function ImageUploader({ value, onChange, isProcessing, onProcessingChange }: Props) {
  const id = useId()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) return
    
    if (!file.type.match(/^image\/(png|jpeg)$/)) {
      toast.error('Please select a PNG or JPG image.')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be ≤10MB.')
      return
    }

    try {
      onProcessingChange?.(true)
      const dataUrl = await downscaleIfNeeded(file, 1920)
      onChange(dataUrl)
      toast.success('Image processed successfully!')
    } catch (e) {
      toast.error('Failed to process image. Please try a different file.')
      console.error(e)
    } finally {
      onProcessingChange?.(false)
    }
  }, [onChange, onProcessingChange])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const clearImage = useCallback(() => {
    onChange(null)
    toast.success('Image cleared')
  }, [onChange])

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium">
        Upload image (PNG/JPG, ≤10MB; auto-downscale if needed)
      </label>
      
      <div
        className={`rounded-2xl border-2 border-dashed p-6 transition-colors duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && document.getElementById(id)?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isProcessing) {
            e.preventDefault()
            document.getElementById(id)?.click()
          }
        }}
        aria-label="Click to upload or drag and drop an image"
      >
        {value ? (
          <div className="relative">
            <img src={value} alt="Preview" className="max-h-64 w-auto mx-auto rounded-xl" />
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearImage()
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:ring-2 focus:ring-red-300"
              aria-label="Remove image"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {isDragOver ? 'Drop your image here' : 'Upload an image'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop or click to select • PNG, JPG up to 10MB
            </p>
          </div>
        )}
      </div>

      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="hidden"
        disabled={isProcessing}
      />
    </div>
  )
}
