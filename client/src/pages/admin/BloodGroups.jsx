import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Badge from '../../components/ui/Badge'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import { api } from '../../utils/apiService'

// Compute a status category based on the donor count
const getStatus = (count) => {
  if (count >= 200) return 'Surplus'
  if (count >= 100) return 'Adequate'
  if (count >= 30) return 'Low'
  return 'Critical'
}

const STATUS_META = {
  Critical: { variant: 'danger', fill: 'bg-red-600', track: 'bg-red-100 dark:bg-red-950/40' },
  Low: { variant: 'warning', fill: 'bg-orange-500', track: 'bg-orange-100 dark:bg-orange-950/40' },
  Adequate: { variant: 'success', fill: 'bg-green-600', track: 'bg-green-100 dark:bg-green-950/40' },
  Surplus: { variant: 'info', fill: 'bg-blue-600', track: 'bg-blue-100 dark:bg-blue-950/40' },
}

const COLUMNS = [
  { key: 'group', label: 'Blood Group' },
  { key: 'donors', label: 'Total Donors' },
  { key: 'status', label: 'Status' },
]

export default function BloodGroups() {
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('group')
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    api.get('/admin/blood-groups.php')
      .then((data) => {
        if (data.success) setCounts(data.counts || {})
      })
      .catch((err) => console.error('Failed to load blood groups:', err))
      .finally(() => setLoading(false))
  }, [])

  const groupData = Object.entries(counts).map(([group, donors]) => {
    const status = getStatus(donors)
    const maxCount = Math.max(...Object.values(counts), 1)
    const supply = Math.round((donors / maxCount) * 100)
    return { group, donors, status, supply }
  })

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...groupData].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    let cmp
    if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
    else cmp = String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading blood group data...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Groups"
        subtitle="Monitor donor pools by blood group."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {groupData.map((g) => {
          const meta = STATUS_META[g.status]
          return (
            <div
              key={g.group}
              className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between">
                <BloodGroupBadge group={g.group} size="lg" />
                <Badge variant={meta.variant}>{g.status}</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                  {g.donors.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Donors</p>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-slate-400">
                  <span>Supply Level</span>
                  <span>{g.supply}%</span>
                </div>
                <div className={`h-2 w-full overflow-hidden rounded-md ${meta.track}`}>
                  <div
                    className={`h-full rounded-md ${meta.fill}`}
                    style={{ width: `${g.supply}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-slate-100">
          Blood Group Summary
        </h3>
        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/60">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className="cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && (
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`}
                          />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr
                    key={row.group}
                    className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <BloodGroupBadge group={row.group} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                      {row.donors.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_META[row.status].variant}>{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
