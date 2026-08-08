export default function Input({
  label,
  icon,
  leftIcon,
  rightIcon,
  onRightIconClick,
  rightIconLabel,
  error,
  hint,
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name
  const LeftIcon = leftIcon || icon
  const RightIcon = rightIcon
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {LeftIcon && (
          <LeftIcon className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400 dark:text-slate-500" />
        )}
        <input
          id={inputId}
          className={`h-10 w-full rounded-md border bg-white text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${LeftIcon ? 'pl-10' : 'pl-4'} ${RightIcon ? 'pr-10' : 'pr-4'} ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300 focus:border-red-500 dark:border-slate-600'
          }`}
          {...props}
        />
        {RightIcon &&
          (onRightIconClick ? (
            <button
              type="button"
              onClick={onRightIconClick}
              aria-label={rightIconLabel || 'Toggle'}
              className="absolute right-3 flex items-center text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <RightIcon className="h-4 w-4" />
            </button>
          ) : (
            <RightIcon className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400 dark:text-slate-500" />
          ))}
      </div>
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <span className="text-xs text-gray-400 dark:text-slate-500">{hint}</span>
      ) : null}
    </div>
  )
}
