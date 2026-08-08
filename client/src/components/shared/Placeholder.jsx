import { Construction } from 'lucide-react'
import PageHeader from './PageHeader'

export default function Placeholder({ title, subtitle, icon: Icon = Construction, guest = false }) {
  const body = (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50/60 px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-800/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-slate-400">
        {subtitle || 'This section is being crafted and will be available shortly.'}
      </p>
    </div>
  )

  if (guest) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <PageHeader title={title} subtitle={subtitle} />
        {body}
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      {body}
    </div>
  )
}
