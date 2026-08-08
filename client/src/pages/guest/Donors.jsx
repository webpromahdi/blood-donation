import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import DonorCard from '../../components/shared/DonorCard'
import { BLOOD_GROUPS, BANGLADESH_DIVISIONS } from '../../utils/constants'
import { api } from '../../utils/apiService'

export default function Donors() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState(searchParams.get('group') || '')
  const [division, setDivision] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [page, setPage] = useState(1)
  
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch donors whenever filters or page change
  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', page)
        if (query) params.append('query', query)
        if (group) params.append('group', group)
        if (division) params.append('division', division)
        if (onlyAvailable) params.append('available', '1')

        const res = await api.get(`/guest/donors.php?${params.toString()}`)
        if (res.success) {
          setDonors(res.donors || [])
          setTotalPages(res.totalPages || 1)
          setTotalCount(res.total || 0)
        }
      } catch (error) {
        console.error("Failed to fetch donors:", error)
      } finally {
        setLoading(false)
      }
    }

    // Debounce the fetch a little to avoid too many requests while typing
    const delayDebounceFn = setTimeout(() => {
      fetchDonors()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, group, division, onlyAvailable, page])

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
          Search verified voluntary donors across Bangladesh. Filter
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
              {totalCount}
            </span>{' '}
            donors
          </p>
          
          {loading ? (
            <div className="rounded-md border border-dashed border-gray-300 py-20 text-center text-gray-400 dark:border-slate-700 dark:text-slate-500">
              Loading donors...
            </div>
          ) : donors.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 py-20 text-center text-gray-400 dark:border-slate-700 dark:text-slate-500">
              No donors match your filters.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {donors.map((donor) => (
                  <DonorCard key={donor.id} donor={donor} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
