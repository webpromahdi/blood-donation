import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [render, setRender] = useState(visible)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (visible) {
      setRender(true)
      setIsClosing(false)
    } else if (render) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setRender(false)
        setIsClosing(false)
      }, 250) // match animation duration
      return () => clearTimeout(timer)
    }
  }, [visible, render])

  useEffect(() => {
    if (!render) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [render, onClose])

  if (!render) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm ${isClosing ? 'fade-out' : 'fade-in'}`}
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[calc(100vh-2rem)] flex-col w-full ${SIZES[size] || SIZES.md} rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 ${isClosing ? 'modal-out' : 'modal-in'}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 dark:border-slate-700 px-6 py-4">
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
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 dark:border-slate-700 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
