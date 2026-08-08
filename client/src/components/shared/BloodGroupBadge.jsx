import { Droplet } from 'lucide-react'
import { BLOOD_GROUP_COLORS } from '../../utils/constants'

const TONE = {
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/50 dark:text-red-300',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-300',
  purple:
    'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/50 dark:text-purple-300',
  green:
    'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950/50 dark:text-green-300',
}

export default function BloodGroupBadge({ group, size = 'md', showIcon = true }) {
  const tone = TONE[BLOOD_GROUP_COLORS[group]] || TONE.red
  const dims =
    size === 'lg'
      ? 'text-base px-3 py-1 gap-1.5'
      : size === 'sm'
        ? 'text-xs px-2 py-0.5 gap-1'
        : 'text-sm px-2.5 py-1 gap-1.5'
  return (
    <span
      className={`inline-flex items-center rounded-md font-bold ring-1 ring-inset ${tone} ${dims}`}
    >
      {showIcon && (
        <Droplet className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} fill="currentColor" />
      )}
      {group}
    </span>
  )
}
