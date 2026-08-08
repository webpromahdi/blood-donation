export default function Skeleton({
  className = '',
  width,
  height,
  circle = false,
  rounded = 'rounded-md',
}) {
  const style = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height
  const shape = circle ? 'rounded-full' : rounded
  const dims = width || height ? '' : 'h-4 w-full'
  return <div className={`skeleton ${shape} ${dims} ${className}`} style={style} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Skeleton circle width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <Skeleton height={12} />
        <Skeleton height={12} />
        <Skeleton width="80%" height={12} />
      </div>
      <Skeleton height={36} className="mt-5" />
    </div>
  )
}
