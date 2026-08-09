import { useMemo, useState, useEffect } from 'react'
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Check,
  X,
  ChevronDown,
  Droplet,
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
import { api } from '../../utils/apiService'
import { BLOOD_GROUPS, URGENCY_LEVELS, STATUS_COLORS } from '../../utils/constants'

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected', 'In_Progress', 'Donor_Assigned', 'On_The_Way', 'Reached', 'Completed', 'Cancelled']
const URGENCY_OPTIONS = ['All', 'Normal', 'Urgent', 'Emergency']
const PER_PAGE = 10

const ActionButtons = ({ request, onAction }) => {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={() => onAction('view', request)}
        className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </button>
      {request.status === 'pending' && (
        <button
          onClick={() => onAction('approve', request)}
          className="flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
        >
          <Check className="h-3.5 w-3.5" />
          Approve
        </button>
      )}
    </div>
  )
}

export default function Requests() {
  const { toast } = useToast()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('All')
  const [status, setStatus] = useState('All')
  const [urgency, setUrgency] = useState('All')
  const [applied, setApplied] = useState({ search: '', group: 'All', status: 'All', urgency: 'All' })

  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/requests.php')
      if (data.success) setRequests(data.requests || [])
    } catch (err) {
      console.error('Failed to fetch requests:', err)
      toast('Failed to load requests', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = applied.search.trim().toLowerCase()
    let rows = requests.filter((r) => {
      if (q && ![r.request_code, r.patient_name, r.hospital_name].some((v) => (v || '').toLowerCase().includes(q))) return false
      if (applied.group !== 'All' && r.blood_type !== applied.group) return false
      if (applied.status !== 'All' && r.status !== applied.status.toLowerCase()) return false
      if (applied.urgency !== 'All' && r.urgency !== applied.urgency.toLowerCase()) return false
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
  }, [requests, applied, sortKey, sortDir])

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
    setApplied({ search, group, status, urgency })
    setPage(1)
  }
  
  const reset = () => {
    setSearch('')
    setGroup('All')
    setStatus('All')
    setUrgency('All')
    setApplied({ search: '', group: 'All', status: 'All', urgency: 'All' })
    setPage(1)
  }

  const openModal = (key, req) => {
    setSelected(req)
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
      const targetStatus = modal === 'approve' ? 'approved' : 'rejected'
      const data = await api.post('/admin/requests/update-status.php', { request_id: selected.id, status: targetStatus })
      
      if (data?.success) {
        toast(data.message || 'Action completed', { type: 'success' })
        setRequests((prev) =>
          prev.map((r) =>
            r.id === selected.id ? { ...r, status: targetStatus } : r
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
    { key: 'code', label: <SortHeader label="Code" colKey="request_code" /> },
    { key: 'patient', label: <SortHeader label="Patient" colKey="patient_name" /> },
    { key: 'group', label: 'Group' },
    { key: 'hospital', label: <SortHeader label="Hospital" colKey="hospital_name" /> },
    { key: 'urgency', label: 'Urgency' },
    { key: 'status', label: <SortHeader label="Status" colKey="status" /> },
    { key: 'date', label: <SortHeader label="Date" colKey="created_at" /> },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Blood Requests"
        subtitle="Review, approve, and track all blood requests."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="ml-auto">
          <Button variant="secondary" onClick={() => setShowFilters((s) => !s)}>
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Search"
              leftIcon={Search}
              placeholder="Code, Patient or Hospital"
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
              label="Urgency"
              options={URGENCY_OPTIONS}
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
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
        empty={loading ? 'Loading requests...' : 'No requests match your filters.'}
        renderRow={(r) => (
          <>
            <Td>
              <span className="font-medium text-gray-900 dark:text-slate-100">{r.request_code}</span>
            </Td>
            <Td>
              <div className="font-medium text-gray-900 dark:text-slate-100">{r.patient_name}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{r.quantity} Unit(s)</div>
            </Td>
            <Td>
              <BloodGroupBadge group={r.blood_type} size="sm" />
            </Td>
            <Td>
              <div className="text-gray-900 dark:text-slate-200">{r.hospital_name}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{r.city}</div>
            </Td>
            <Td>
              <Badge variant={URGENCY_LEVELS[r.urgency]?.color || 'neutral'} dot>
                {URGENCY_LEVELS[r.urgency]?.label || r.urgency}
              </Badge>
            </Td>
            <Td>
              <Badge variant={STATUS_COLORS[r.status] || 'neutral'} className="capitalize">
                {r.status.replace('_', ' ')}
              </Badge>
            </Td>
            <Td className="whitespace-nowrap text-gray-500 dark:text-slate-400">
              {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
            </Td>
            <Td>
              <ActionButtons request={r} onAction={openModal} />
            </Td>
          </>
        )}
      />

      <Pagination currentPage={current} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} itemsPerPage={PER_PAGE} />

      {/* Approve */}
      <Modal open={modal === 'approve'} onClose={closeModal} title="Approve Request" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={confirming}>Cancel</Button>
            <Button variant="primary" onClick={confirmAction} loading={confirming}>Approve</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Approve request <strong>{selected?.request_code}</strong>? Once approved, it will be visible to eligible donors.
        </p>
      </Modal>

      {/* Reject */}
      <Modal open={modal === 'reject'} onClose={closeModal} title="Reject Request" size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={confirming}>Cancel</Button>
            <Button variant="danger" onClick={confirmAction} loading={confirming}>Reject</Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-gray-600 dark:text-slate-300">
          Rejecting request <strong>{selected?.request_code}</strong>. Are you sure?
        </p>
      </Modal>

      {/* View Details */}
      <Modal
        open={modal === 'view'}
        onClose={closeModal}
        title="Blood Request Details"
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
                <Droplet className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Patient: {selected.patient_name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Request Code: {selected.request_code}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={STATUS_COLORS[selected.status] || 'neutral'} size="sm" className="capitalize">
                    {selected.status.replace('_', ' ')}
                  </Badge>
                  <BloodGroupBadge group={selected.blood_type} size="sm" />
                  <Badge variant={URGENCY_LEVELS[selected.urgency]?.color || 'neutral'} size="sm" dot>
                    {URGENCY_LEVELS[selected.urgency]?.label || selected.urgency}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Patient Age</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.patient_age ? `${selected.patient_age} Years` : '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Quantity Needed</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.quantity} Unit(s)</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Required By</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.required_date ? new Date(selected.required_date).toLocaleDateString() : '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Contact Phone</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.contact_phone || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Hospital</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.hospital_name || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 dark:text-slate-400">City</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.city || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs text-gray-500 dark:text-slate-400">Medical Reason</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.medical_reason || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs text-gray-500 dark:text-slate-400">Requester</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{selected.requester_name || '—'} ({selected.requester_type})</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
