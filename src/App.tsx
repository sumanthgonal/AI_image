
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, Zap, StopCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import ImageUploader from './components/ImageUploader'
import PromptForm from './components/PromptForm'
import Spinner from './components/Spinner'
import History from './components/History'
import ThemeToggle from './components/ThemeToggle'
import ErrorBoundary from './components/ErrorBoundary'
import { loadHistory, saveGeneration, type Generation } from './utils/storage'
import { mockGenerate, withRetries } from './utils/mockApi'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

export default function App() {
  const [image, setImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('Editorial')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [, setError] = useState<string | null>(null)
  const [current, setCurrent] = useState<Generation | null>(null)
  const [history, setHistory] = useState<Generation[]>([])
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const canGenerate = useMemo(() => Boolean(image && prompt.trim() && !isProcessingImage), [image, prompt, isProcessingImage])

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !image) return
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setStatus('loading')
    setError(null)
    
    const loadingToast = toast.loading('Generating your image...', {
      duration: Infinity,
    })
    
    try {
      const gen = await withRetries(
        async (attempt, signal) => {
          if (attempt > 1) {
            toast.loading(`Retry attempt ${attempt}/3...`, { id: loadingToast })
          }
          return mockGenerate({ imageDataUrl: image, prompt, style }, { signal })
        },
        3,
        500,
        ac,
      )
      setCurrent(gen)
      saveGeneration(gen)
      setHistory(loadHistory())
      setStatus('success')
      toast.success('Image generated successfully!', { id: loadingToast })
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        setError('Request aborted')
        toast.error('Generation cancelled', { id: loadingToast })
      } else {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error'
        setError(errorMessage)
        toast.error(`Generation failed: ${errorMessage}`, { id: loadingToast })
      }
      setStatus('error')
    } finally {
      abortRef.current = null
    }
  }, [image, prompt, style, canGenerate])

  const handleAbort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const restore = useCallback((g: Generation) => {
    setImage(g.imageUrl)
    setPrompt(g.prompt)
    setStyle(g.style)
    setCurrent(g)
    setStatus('success')
    setError(null)
    toast.success('Generation restored from history')
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'g',
      ctrlKey: true,
      callback: handleGenerate,
      description: 'Generate image'
    },
    {
      key: 'Escape',
      callback: handleAbort,
      description: 'Cancel generation'
    },
    {
      key: '?',
      callback: () => setShowShortcuts(!showShortcuts),
      description: 'Show keyboard shortcuts'
    },
    {
      key: 'c',
      ctrlKey: true,
      callback: () => {
        if (image) {
          setImage(null)
          toast.success('Image cleared')
        }
      },
      description: 'Clear image'
    }
  ])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-gray-800 dark:text-white',
          }}
        />
        
        <main className="mx-auto max-w-6xl p-4 md:p-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                AI Studio Enhanced
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Upload, create, and generate with advanced features and shortcuts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500"
                title="Keyboard shortcuts (?)"
              >
                <Keyboard size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
              <ThemeToggle />
            </div>
          </header>

          <section className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <ImageUploader 
                value={image} 
                onChange={setImage}
                isProcessing={isProcessingImage}
                onProcessingChange={setIsProcessingImage}
              />
              <PromptForm prompt={prompt} style={style} onPrompt={setPrompt} onStyle={setStyle} />
              
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="flex items-center space-x-2 rounded-xl bg-blue-600 text-white px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  onClick={handleGenerate}
                  disabled={!canGenerate || status === 'loading'}
                  aria-disabled={!canGenerate || status === 'loading'}
                >
                  <Zap size={16} />
                  <span>Generate</span>
                  <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-blue-700 rounded">Ctrl+G</kbd>
                </button>
                
                {status === 'loading' && (
                  <button
                    className="flex items-center space-x-2 rounded-xl border border-red-300 text-red-600 dark:text-red-400 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950 focus:ring-2 focus:ring-red-500"
                    onClick={handleAbort}
                  >
                    <StopCircle size={16} />
                    <span>Cancel</span>
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs border rounded">Esc</kbd>
                  </button>
                )}
                
                {status === 'loading' && <Spinner label="Generating" />}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Live Preview</h2>
                <div className="grid gap-6 lg:grid-cols-2 items-start">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700">
                    {image ? (
                      <img src={image} alt="Selected" className="w-full h-64 object-contain rounded-lg" />
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        No image selected
                      </div>
                    )}
                  </div>
                  <div className="text-sm space-y-3">
                    <div>
                      <label className="font-medium text-gray-900 dark:text-gray-100">Prompt:</label>
                      <p className="text-gray-600 dark:text-gray-400 mt-1" aria-live="polite">
                        {prompt || '(empty)'}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-900 dark:text-gray-100">Style:</label>
                      <p className="text-gray-600 dark:text-gray-400 mt-1" aria-live="polite">{style}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-900 dark:text-gray-100">Status:</label>
                      <p className={`mt-1 font-medium ${
                        status === 'success' ? 'text-green-600' :
                        status === 'error' ? 'text-red-600' :
                        status === 'loading' ? 'text-blue-600' :
                        'text-gray-600 dark:text-gray-400'
                      }`} aria-live="polite">
                        {status === 'idle' ? 'Ready' : status}
                      </p>
                    </div>
                    {current && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <p><strong>Last ID:</strong> {current.id.slice(0, 8)}...</p>
                          <p><strong>Created:</strong> {new Date(current.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <History items={history} onSelect={restore} />
            </div>
          </section>

          {/* Keyboard shortcuts modal */}
          {showShortcuts && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Generate image</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+G</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cancel generation</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Clear image</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+C</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Toggle shortcuts</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">?</kbd>
                  </div>
                </div>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">  //from this website i am going to do some things
            <p>Enhanced with drag-and-drop, dark mode, keyboard shortcuts, and improved accessibility</p>
          </footer>
        </main>
      </div>
    </ErrorBoundary>
  )
}
