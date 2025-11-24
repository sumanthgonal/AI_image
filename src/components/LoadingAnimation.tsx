import { useEffect, useState } from 'react'

interface Props {
  isVisible: boolean
  message?: string
}

export default function LoadingAnimation({ isVisible, message = 'Processing...' }: Props) {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          AI Generation in Progress
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {message}{dots}
        </p>
        <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  )
}