import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  page,
  currentPage,
  totalPages = 1,
  onChange,
  onPageChange,
  totalItems,
  itemsPerPage,
}) {
  const active = currentPage ?? page ?? 1
  const change = onPageChange || onChange || (() => {})
  if (totalPages <= 1 && !totalItems) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - active) <= 1,
  )
  const go = (p) => p >= 1 && p <= totalPages && change(p)

  const from = totalItems ? (active - 1) * (itemsPerPage || 0) + 1 : null
  const to = totalItems ? Math.min(active * (itemsPerPage || 0), totalItems) : null

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      {totalItems != null && (
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Showing{' '}
          <span className="font-medium text-gray-900 dark:text-slate-200">
            {from}–{to}
          </span>{' '}
          of{' '}
          <span className="font-medium text-gray-900 dark:text-slate-200">
            {totalItems}
          </span>{' '}
          results
        </p>
      )}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => go(active - 1)}
            disabled={active === 1}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pages.map((p, idx) => {
            const prev = pages[idx - 1]
            const gap = prev && p - prev > 1
            return (
              <span key={p} className="flex items-center gap-1">
                {gap && <span className="px-1 text-gray-400">…</span>}
                <button
                  onClick={() => go(p)}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                    p === active
                      ? 'bg-red-600 text-white'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              </span>
            )
          })}
          <button
            onClick={() => go(active + 1)}
            disabled={active === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
