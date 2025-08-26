
import { Generation } from '../utils/storage'

type Props = {
  items: Generation[]
  onSelect: (g: Generation) => void
}

export default function History({ items, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">History (last 5)</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No generations yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3" role="list">
          {items.map((g) => (
            <li key={g.id}>
              <button
                className="w-full text-left rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:shadow-md focus:shadow-md focus:ring-2 focus:ring-blue-500 p-2 transition-all"
                onClick={() => onSelect(g)}
                aria-label={`Restore generation: ${g.prompt.slice(0, 50)}... from ${new Date(g.createdAt).toLocaleString()}`}
              >
                <img src={g.imageUrl} alt="" className="h-28 w-full object-cover rounded-lg mb-2" />
                <div className="text-sm">
                  <p className="font-medium line-clamp-2 text-gray-900 dark:text-gray-100">{g.prompt}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{g.style}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{new Date(g.createdAt).toLocaleString()}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
