import { ChevronDown } from 'lucide-react'

export default function Select({
  label,
  options = [],
  error,
  className = '',
  id,
  placeholder,
  ...props
}) {
  const selectId = id || props.name
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`h-10 w-full appearance-none rounded-md border bg-white dark:bg-slate-900 px-3 pr-9 text-sm text-gray-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40 ${
            error
              ? 'border-red-400'
              : 'border-gray-200 dark:border-slate-700 focus:border-red-500'
          }`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value
            const text = typeof opt === 'string' ? opt : opt.label
            return (
              <option key={value} value={value}>
                {text}
              </option>
            )
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
      </div>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  )
}
