
import { useId, useState, useMemo } from 'react'
import { Search, X, Palette } from 'lucide-react'

type Props = {
  prompt: string
  style: string
  onPrompt: (v: string) => void
  onStyle: (v: string) => void
}

const STYLES = [
  { name: 'Editorial', description: 'Clean, professional, magazine-style' },
  { name: 'Streetwear', description: 'Urban, casual, contemporary fashion' },
  { name: 'Vintage', description: 'Retro, nostalgic, timeless appeal' },
  { name: 'Minimalist', description: 'Simple, clean, less is more' },
  { name: 'Artistic', description: 'Creative, expressive, fine art inspired' },
  { name: 'Corporate', description: 'Professional, business-oriented' },
  { name: 'Cinematic', description: 'Movie-like, dramatic lighting' },
  { name: 'Cyberpunk', description: 'Futuristic, neon, high-tech aesthetic' },
  { name: 'Bohemian', description: 'Free-spirited, eclectic, artistic' },
  { name: 'Industrial', description: 'Raw, mechanical, urban decay' }
]

export default function PromptForm({ prompt, style, onPrompt, onStyle }: Props) {
  const promptId = useId()
  const styleId = useId()
  const searchId = useId()
  const [styleSearch, setStyleSearch] = useState('')
  const [showStyleGrid, setShowStyleGrid] = useState(false)

  const filteredStyles = useMemo(() => {
    if (!styleSearch.trim()) return STYLES
    const search = styleSearch.toLowerCase()
    return STYLES.filter(s => 
      s.name.toLowerCase().includes(search) || 
      s.description.toLowerCase().includes(search)
    )
  }, [styleSearch])

  const selectedStyle = STYLES.find(s => s.name === style) || STYLES[0]

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={promptId} className="block font-medium text-gray-900 dark:text-gray-100 mb-2">
          Prompt
        </label>
        <textarea
          id={promptId}
          value={prompt}
          onChange={(e) => onPrompt(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your creative vision..."
          rows={4}
          aria-describedby="prompt-help"
        />
        <p id="prompt-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Be descriptive and specific for better results.
        </p>
      </div>

      <div>
        <label htmlFor={styleId} className="block font-medium text-gray-900 dark:text-gray-100 mb-2">
          Style
        </label>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStyleGrid(!showStyleGrid)}
            className="w-full flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 focus:ring-2 focus:ring-blue-500"
            aria-expanded={showStyleGrid}
            aria-haspopup="true"
          >
            <div className="flex items-center space-x-2">
              <Palette size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="font-medium">{selectedStyle?.name}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedStyle?.description}
            </span>
          </button>

          {showStyleGrid && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
              <div className="mb-3">
                <label htmlFor={searchId} className="sr-only">Search styles</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id={searchId}
                    type="text"
                    value={styleSearch}
                    onChange={(e) => setStyleSearch(e.target.value)}
                    placeholder="Search styles..."
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  {styleSearch && (
                    <button
                      onClick={() => setStyleSearch('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {filteredStyles.map((styleOption) => (
                  <button
                    key={styleOption.name}
                    onClick={() => {
                      onStyle(styleOption.name)
                      setShowStyleGrid(false)
                      setStyleSearch('')
                    }}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      style === styleOption.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {styleOption.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {styleOption.description}
                    </div>
                  </button>
                ))}
              </div>
              
              {filteredStyles.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No styles found matching &quot;{styleSearch}&quot;
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
