import { useEffect } from 'react'
import { X } from 'lucide-react'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export default function Modal({
  open,
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
}) {
  const visible = isOpen ?? open
  useEffect(() => {
    if (!visible) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`fade-in relative z-10 w-full ${SIZES[size] || SIZES.md} rounded-md border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-slate-700 px-6 py-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
