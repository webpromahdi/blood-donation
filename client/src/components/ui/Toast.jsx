import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react'

const ToastContext = createContext({ toast: () => {} })

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const ACCENTS = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message, options = {}) => {
      const id = Date.now() + Math.random()
      const type = options.type || 'success'
      setToasts((list) => [...list, { id, message, type, title: options.title }])
      setTimeout(() => dismiss(id), options.duration || 3500)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info
          return (
            <div
              key={t.id}
              className="toast-in flex items-start gap-3 rounded-md border border-gray-200 bg-white p-3.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ACCENTS[t.type]}`} />
              <div className="min-w-0 flex-1">
                {t.title && (
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {t.title}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-slate-300">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
