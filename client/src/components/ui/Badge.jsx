const TONES = {
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/50 dark:text-red-300',
  green: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950/50 dark:text-green-300',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-300',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950/50 dark:text-orange-300',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/50 dark:text-purple-300',
  gray: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-slate-800 dark:text-slate-300',
}

// Spec variant names map onto the internal tone palette.
const VARIANT_TO_TONE = {
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  info: 'blue',
  neutral: 'gray',
  primary: 'red',
}

const SIZES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export default function Badge({
  variant,
  tone,
  size = 'md',
  dot = false,
  className = '',
  children,
}) {
  const resolved = tone || VARIANT_TO_TONE[variant] || 'gray'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium ring-1 ring-inset ${TONES[resolved]} ${SIZES[size] || SIZES.md} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
