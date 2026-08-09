import { useMemo, useRef, useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Check,
  Ban,
  X,
  Trash2,
  ChevronDown,
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import Table, { Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { BLOOD_GROUPS, BANGLADESH_DIVISIONS } from '../../utils/constants'
import { api } from '../../utils/apiService'

const STATUS_VARIANT = {
  pending: 'warning',
  approved: 'success',
  suspended: 'danger',
  rejected: 'neutral',
}

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected']

const PER_PAGE = 10

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

const ActionButtons = ({ donor, onAction }) => {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={() => onAction('view', donor)}
        className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </button>
      {donor.status === 'pending' && (
        <button
          onClick={() => onAction('approve', donor)}
          className="flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
        >
          <Check className="h-3.5 w-3.5" />
          Approve
        </button>
      )}
    </div>
  )
}

export default function Donors() {
  const { toast } = useToast()

  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)

  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('All')
  const [status, setStatus] = useState('All')
  const [applied, setApplied] = useState({ search: '', group: 'All', status: 'All' })

  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const [modal, setModal] = useState(null) // 'approve' | 'reject'
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    try {
      const params = new URLSearchParams()
      if (applied.group !== 'All') params.append('blood_type', applied.group)
      if (applied.status !== 'All') params.append('approval_status', applied.status.toLowerCase())
      const data = await api.get(`/admin/donors.php?${params}`)
      if (data.success) {
        setDonors(data.donors || [])
      }
    } catch (err) {
      console.error('Failed to fetch donors:', err)
      toast('Failed to load donors', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = applied.search.trim().toLowerCase()
    let rows = donors.filter((d) => {
      if (q && ![d.name, d.email, d.phone].some((v) => (v || '').toLowerCase().includes(q))) return false
      if (applied.group !== 'All' && d.blood_group !== applied.group) return false
      if (applied.status !== 'All' && d.status !== applied.status.toLowerCase()) return false
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
  }, [donors, applied, sortKey, sortDir])

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

  const apply = () => {
    setApplied({ search, group, status })
    setPage(1)
    fetchDonors()
  }
  
  const reset = () => {
    setSearch('')
    setGroup('All')
    setStatus('All')
    setApplied({ search: '', group: 'All', status: 'All' })
    setPage(1)
    fetchDonors()
  }

  const openModal = (key, donor) => {
    setSelected(donor)
    setReason('')
    setModal(key)
  }
  const closeModal = () => {
    setModal(null)
    setSelected(null)
  }

  const confirmAction = async () => {
    if (!selected) return
    setConfirming(true)
    try {
      let data
      if (modal === 'approve') {
        data = await api.post('/admin/donors/approve.php', { donor_id: selected.id })
      } else if (modal === 'reject') {
        data = await api.post('/admin/donors/reject.php', { donor_id: selected.id, reason })
      }
      if (data?.success) {
        toast(data.message || 'Action completed', { type: 'success' })
        // Update local state optimistically
        setDonors((prev) =>
          prev.map((d) =>
            d.id === selected.id
              ? { ...d, status: modal === 'approve' ? 'approved' : 'rejected' }
              : d
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
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
    >
      {label}
      <ChevronDown
        className={`h-3 w-3 transition-transform ${
          sortKey === colKey ? (sortDir === 'asc' ? 'rotate-180' : '') : 'opacity-30'
        }`}
      />
    </button>
  )

  const columns = [
    { key: 'idx', label: '#', className: 'w-12' },
    { key: 'name', label: <SortHeader label="Name" colKey="name" /> },
    { key: 'email', label: <SortHeader label="Email" colKey="email" /> },
    { key: 'group', label: 'Blood Group' },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
    { key: 'status', label: <SortHeader label="Status" colKey="status" /> },
    { key: 'registered', label: <SortHeader label="Registered" colKey="registered_at" /> },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ]

  const countByStatus = (s) => donors.filter((d) => d.status === s).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Donors"
        subtitle="Review, approve, and manage registered donors."
        action={
          <Button
            variant="outline"
            onClick={() => toast('Export CSV coming soon.', { type: 'info' })}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatChip label="Total" value={donors.length} tone="bg-slate-400" />
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Search"
              leftIcon={Search}
              placeholder="Name, email or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && apply()}
            />
            <Select
              label="Blood Group"
              options={['All', ...BLOOD_GROUPS]}
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={apply}>
              Apply
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        data={loading ? [] : paged}
        empty={loading ? 'Loading donors...' : 'No donors match your filters.'}
        renderRow={(d, i) => (
          <>
            <Td className="text-gray-400">{(current - 1) * PER_PAGE + i + 1}</Td>
            <Td>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  {initials(d.name)}
                </span>
                <span className="font-medium text-gray-900 dark:text-slate-100">{d.name}</span>
              </div>
            </Td>
            <Td className="text-gray-500 dark:text-slate-400">{d.email}</Td>
            <Td>
              <BloodGroupBadge group={d.blood_group} size="sm" />
            </Td>
            <Td className="whitespace-nowrap text-gray-500 dark:text-slate-400">{d.phone}</Td>
            <Td>{d.city || '—'}</Td>
            <Td>
              <Badge variant={STATUS_VARIANT[d.status] || 'neutral'} size="sm" dot>
                {(d.status || 'unknown').charAt(0).toUpperCase() + (d.status || '').slice(1)}
              </Badge>
            </Td>
            <Td className="whitespace-nowrap text-gray-500 dark:text-slate-400">
              {d.registered_at ? new Date(d.registered_at).toLocaleDateString() : '—'}
            </Td>
            <Td>
              <ActionButtons donor={d} onAction={openModal} />
            </Td>
          </>
        )}
      />

      <Pagination
        currentPage={current}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filtered.length}
        itemsPerPage={PER_PAGE}
      />

      {/* Approve */}
      <Modal
        open={modal === 'approve'}
        onClose={closeModal}
        title="Approve Donor"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={confirming}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmAction} loading={confirming}>
              Approve
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Approve <span className="font-semibold">{selected?.name}</span> as a verified donor? They
          will be able to receive blood requests.
        </p>
      </Modal>

      {/* Reject */}
      <Modal
        open={modal === 'reject'}
        onClose={closeModal}
        title="Reject Donor"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={confirming}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmAction} loading={confirming}>
              Reject
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-gray-600 dark:text-slate-300">
          Rejecting <span className="font-semibold">{selected?.name}</span>. Please provide a reason:
        </p>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
          Reason for rejection
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Provide a reason for rejecting this donor…"
          className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </Modal>

      {/* View Details */}
      <Modal
        open={modal === 'view'}
        onClose={closeModal}
        title="Donor Details"
        size="lg"
        footer={
          <div className="flex items-center justify-end w-full gap-2">
            <Button variant="ghost" onClick={closeModal}>
              Close
            </Button>
            {selected?.status === 'pending' && (
              <>
                <Button variant="danger" onClick={() => setModal('reject')}>Reject</Button>
                <Button variant="primary" onClick={() => setModal('approve')}>Approve</Button>
              </>
            )}
          </div>
        }
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4 dark:border-slate-700">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                {initials(selected.name)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{selected.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{selected.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[selected.status] || 'neutral'} size="sm">
                    {(selected.status || 'unknown').toUpperCase()}
                  </Badge>
                  <BloodGroupBadge group={selected.blood_group} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Phone</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.phone || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">City / Location</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.city || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Age</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.age ? `${selected.age} Years` : '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Gender</span>
                <span className="font-medium text-gray-900 dark:text-slate-200 capitalize">{selected.gender || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Weight</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.weight ? `${selected.weight} kg` : '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Total Donations</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.total_donations || 0}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Last Donation Date</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">
                  {selected.last_donation_date ? new Date(selected.last_donation_date).toLocaleDateString() : 'Never'}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Registered Date</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">
                  {selected.registered_at ? new Date(selected.registered_at).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs text-gray-500 dark:text-slate-400">Full Address</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.address || '—'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
