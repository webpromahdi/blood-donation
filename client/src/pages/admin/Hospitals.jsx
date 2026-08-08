import { useMemo, useState, useEffect } from 'react'
import {
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  ChevronDown,
  Building2,
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Table, { Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../utils/apiService'

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected']
const PER_PAGE = 10

const STATUS_VARIANT = {
  pending: 'warning',
  approved: 'success',
  rejected: 'neutral',
}

function initials(name) {
  return (name || '??')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function StatChip({ label, value, tone }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
      <span className={`h-2 w-2 rounded-full ${tone}`} />
      <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{value}</span>
      <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
    </div>
  )
}

function ActionsMenu({ hospital, onAction }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const items = [
    hospital.status === 'pending' && { key: 'approve', label: 'Approve', icon: Check },
    hospital.status !== 'rejected' && { key: 'reject', label: 'Reject', icon: X },
  ].filter(Boolean)

  if (items.length === 0) return null

  return (
    <div className="relative flex justify-end">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => { close(); onAction(item.key, hospital) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function Hospitals() {
  const { toast } = useToast()

  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)

  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [applied, setApplied] = useState({ search: '', status: 'All' })

  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/hospitals.php')
      if (data.success) setHospitals(data.hospitals || [])
    } catch (err) {
      console.error('Failed to fetch hospitals:', err)
      toast('Failed to load hospitals', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = applied.search.trim().toLowerCase()
    let rows = hospitals.filter((h) => {
      if (q && ![h.name, h.email, h.city].some((v) => (v || '').toLowerCase().includes(q))) return false
      if (applied.status !== 'All' && h.status !== applied.status.toLowerCase()) return false
      return true
    })
    rows = [...rows].sort((a, b) => {
      const av = String(a[sortKey] || '').toLowerCase()
      const bv = String(b[sortKey] || '').toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return rows
  }, [hospitals, applied, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, totalPages)
  const paged = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const apply = () => { setApplied({ search, status }); setPage(1) }
  const reset = () => {
    setSearch(''); setStatus('All')
    setApplied({ search: '', status: 'All' }); setPage(1)
  }

  const openModal = (key, hospital) => {
    setSelected(hospital)
    setReason('')
    setModal(key)
  }
  const closeModal = () => { setModal(null); setSelected(null) }

  const confirmAction = async () => {
    if (!selected) return
    setConfirming(true)
    try {
      let data
      if (modal === 'approve') {
        data = await api.post('/admin/hospitals/approve.php', { hospital_id: selected.id })
      } else if (modal === 'reject') {
        data = await api.post('/admin/hospitals/reject.php', { hospital_id: selected.id, reason })
      }
      if (data?.success) {
        toast(data.message || 'Action completed', { type: 'success' })
        setHospitals((prev) =>
          prev.map((h) =>
            h.id === selected.id
              ? { ...h, status: modal === 'approve' ? 'approved' : 'rejected' }
              : h
          )
        )
        closeModal()
      } else {
        toast(data?.message || 'Action failed', { type: 'error' })
      }
    } catch (err) {
      toast(err?.message || 'Action failed', { type: 'error' })
    } finally {
      setConfirming(false)
    }
  }

  const SortHeader = ({ label, colKey }) => (
    <button
      onClick={() => toggleSort(colKey)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
    >
      {label}
      <ChevronDown className={`h-3 w-3 transition-transform ${sortKey === colKey ? (sortDir === 'asc' ? 'rotate-180' : '') : 'opacity-30'}`} />
    </button>
  )

  const columns = [
    { key: 'idx', label: '#', className: 'w-12' },
    { key: 'name', label: <SortHeader label="Hospital" colKey="name" /> },
    { key: 'type', label: 'Type' },
    { key: 'city', label: 'City' },
    { key: 'email', label: 'Email' },
    { key: 'blood_bank', label: 'Blood Bank' },
    { key: 'status', label: <SortHeader label="Status" colKey="status" /> },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ]

  const countByStatus = (s) => hospitals.filter((h) => h.status === s).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Hospitals"
        subtitle="Review, approve, and manage registered hospitals."
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatChip label="Total" value={hospitals.length} tone="bg-slate-400" />
        <StatChip label="Pending" value={countByStatus('pending')} tone="bg-amber-500" />
        <StatChip label="Approved" value={countByStatus('approved')} tone="bg-green-500" />
        <StatChip label="Rejected" value={countByStatus('rejected')} tone="bg-red-500" />
        <div className="ml-auto">
          <Button variant="secondary" onClick={() => setShowFilters((s) => !s)}>
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Search"
              leftIcon={Search}
              placeholder="Name, email, or city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && apply()}
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" size="sm" onClick={apply}>Apply</Button>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        data={loading ? [] : paged}
        empty={loading ? 'Loading hospitals...' : 'No hospitals match your filters.'}
        renderRow={(h, i) => (
          <>
            <Td className="text-gray-400">{(current - 1) * PER_PAGE + i + 1}</Td>
            <Td>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  <Building2 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-slate-100">{h.name}</p>
                  <p className="truncate text-xs text-gray-400">{h.contact_person || h.phone}</p>
                </div>
              </div>
            </Td>
            <Td>{h.type || '—'}</Td>
            <Td>{h.city || '—'}</Td>
            <Td className="text-gray-500 dark:text-slate-400">{h.email}</Td>
            <Td>
              {h.has_blood_bank
                ? <Badge variant="success" size="sm">Yes</Badge>
                : <Badge variant="neutral" size="sm">No</Badge>}
            </Td>
            <Td>
              <Badge variant={STATUS_VARIANT[h.status] || 'neutral'} size="sm" dot className="capitalize">
                {h.status}
              </Badge>
            </Td>
            <Td>
              <ActionsMenu hospital={h} onAction={openModal} />
            </Td>
          </>
        )}
      />

      <Pagination currentPage={current} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} itemsPerPage={PER_PAGE} />

      {/* Approve */}
      <Modal open={modal === 'approve'} onClose={closeModal} title="Approve Hospital" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={confirming}>Cancel</Button>
            <Button variant="primary" onClick={confirmAction} loading={confirming}>Approve</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Approve <span className="font-semibold">{selected?.name}</span> as a partner hospital? They will be able to post blood requests.
        </p>
      </Modal>

      {/* Reject */}
      <Modal open={modal === 'reject'} onClose={closeModal} title="Reject Hospital" size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={confirming}>Cancel</Button>
            <Button variant="danger" onClick={confirmAction} loading={confirming}>Reject</Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-gray-600 dark:text-slate-300">
          Rejecting <span className="font-semibold">{selected?.name}</span>. Please provide a reason:
        </p>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection…"
          className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </Modal>
    </div>
  )
}
