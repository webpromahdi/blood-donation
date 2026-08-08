import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import DonorCard from '../../components/shared/DonorCard'
import { BLOOD_GROUPS, BANGLADESH_DIVISIONS } from '../../utils/constants'
import { DONORS } from '../../utils/mockData'

const PER_PAGE = 6

export default function Donors() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState(searchParams.get('group') || '')
  const [division, setDivision] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return DONORS.filter((d) => {
      if (query && !d.name.toLowerCase().includes(query.toLowerCase())) return false
      if (group && d.bloodGroup !== group) return false
      if (division && d.division !== division) return false
      if (onlyAvailable && !d.available) return false
      return true
    })
  }, [query, group, division, onlyAvailable])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const current = Math.min(page, Math.max(totalPages, 1))
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const reset = () => {
    setQuery('')
    setGroup('')
    setDivision('')
    setOnlyAvailable(false)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
          Find a blood donor
        </h1>
        <p className="mt-2 text-gray-600 dark:text-slate-300">
          Search {DONORS.length}+ verified voluntary donors across Bangladesh. Filter
          by blood group, division, and availability.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="h-fit rounded-md border border-gray-200 bg-white p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
            <SlidersHorizontal className="h-4 w-4 text-red-600" /> Filters
          </div>
          <div className="mt-5 flex flex-col gap-4">
            <Input
              label="Donor name"
              icon={Search}
              placeholder="e.g. Rahim"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
            <Select
              label="Blood group"
              placeholder="All groups"
              options={BLOOD_GROUPS}
              value={group}
              onChange={(e) => {
                setGroup(e.target.value)
                setPage(1)
              }}
            />
            <Select
              label="Division"
              placeholder="All divisions"
              options={BANGLADESH_DIVISIONS}
              value={division}
              onChange={(e) => {
                setDivision(e.target.value)
                setPage(1)
              }}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => {
                  setOnlyAvailable(e.target.checked)
                  setPage(1)
                }}
                className="h-4 w-4 rounded-md accent-red-600"
              />
              Available now only
            </label>
            <Button variant="ghost" size="sm" onClick={reset}>
              Clear filters
            </Button>
          </div>
        </aside>

        {/* Results */}
        <div>
          <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">
            Showing{' '}
            <span className="font-semibold text-gray-900 dark:text-slate-100">
              {filtered.length}
            </span>{' '}
            donors
          </p>
          {shown.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 py-20 text-center text-gray-400 dark:border-slate-700 dark:text-slate-500">
              No donors match your filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {shown.map((donor) => (
                <DonorCard key={donor.id} donor={donor} />
              ))}
            </div>
          )}
          <div className="mt-8">
            <Pagination page={current} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  )
}
