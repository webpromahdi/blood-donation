import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const numeric = Number(String(target).replace(/[^0-9.]/g, '')) || 0
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(numeric * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

const TREND = {
  up: { icon: TrendingUp, cls: 'text-green-600 dark:text-green-400' },
  down: { icon: TrendingDown, cls: 'text-red-600 dark:text-red-400' },
  neutral: { icon: Minus, cls: 'text-gray-500 dark:text-slate-400' },
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  delta,
  prefix = '',
  suffix = '',
  iconBg = 'bg-red-50 dark:bg-red-950/50',
  iconColor = 'text-red-600 dark:text-red-400',
}) {
  const animated = useCountUp(value)
  const cleaned = String(value).replace(/[^0-9.,]/g, '')
  const isNumeric = cleaned !== '' && /^[0-9.,]+$/.test(cleaned)
  const display = isNumeric ? Math.round(animated).toLocaleString('en-US') : value

  // Reconcile legacy `delta` (signed number) with spec `change`/`changeType`.
  const resolvedType =
    changeType || (delta != null ? (delta >= 0 ? 'up' : 'down') : null)
  const resolvedChange =
    change != null ? change : delta != null ? `${Math.abs(delta)}% vs last month` : null
  const trend = resolvedType ? TREND[resolvedType] : null

  return (
    <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm text-gray-500 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
            {prefix}
            {display}
            {suffix}
          </p>
        </div>
        {Icon && (
          <div
            className={`flex size-12 items-center justify-center rounded-md ${iconBg} ${iconColor}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {resolvedChange != null && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          {trend && (
            <span className={`inline-flex items-center gap-0.5 ${trend.cls}`}>
              <trend.icon className="h-3.5 w-3.5" />
            </span>
          )}
          <span className="text-gray-500 dark:text-slate-400">{resolvedChange}</span>
        </div>
      )}
    </div>
  )
}
