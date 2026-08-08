import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm disabled:bg-red-300',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
  ghost:
    'bg-transparent text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800',
  outline:
    'bg-transparent text-red-600 dark:text-red-400 border border-red-600/70 dark:border-red-400/50 hover:bg-red-50 dark:hover:bg-red-950/40',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
}

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  as: Tag = 'button',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  const isDisabled = disabled || loading
  return (
    <Tag
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${loading ? 'pointer-events-none' : ''} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Tag>
  )
}
