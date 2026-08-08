import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Check, X, Calendar, CheckCircle, Clock, Users } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import Table, { Td } from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../utils/apiService'

const STATUS_TONE = {
  approved: 'success',
  completed: 'success',
  pending: 'warning',
  rejected: 'danger',
  cancelled: 'neutral',
}

export default function Voluntary() {
  const { toast } = useToast()
  
  const [donations, setDonations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hospitals, setHospitals] = useState([])

  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [applied, setApplied] = useState({ search: '', status: 'All' })

  // Action Modals
  const [modal, setModal] = useState(null) // 'approve' | 'reject'
  const [selected, setSelected] = useState(null)
  const [hospitalId, setHospitalId] = useState('')
  const [schedDate, setSchedDate] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    fetchDonations()
    fetchHospitals()
  }, [])

  const fetchDonations = async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/voluntary/list.php')
      if (data.success) {
        setDonations(data.donations || [])
        setStats(data.stats || null)
      }
    } catch (err) {
      console.error('Failed to fetch voluntary donations:', err)
      toast('Failed to load donations', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const fetchHospitals = async () => {
    try {
      // Just to populate the hospital dropdown for approval
      const data = await api.get('/admin/hospitals.php')
      if (data.success) {
        setHospitals(data.hospitals?.filter(h => h.status === 'approved') || [])
      }
    } catch (err) {
      console.error('Failed to fetch hospitals:', err)
    }
  }

  const filtered = useMemo(() => {
    const q = applied.search.trim().toLowerCase()
    return donations.filter((d) => {
      if (q && !d.donor_name.toLowerCase().includes(q) && !d.city.toLowerCase().includes(q)) return false
      if (applied.status !== 'All' && d.status !== applied.status.toLowerCase()) return false
      return true
    })
  }, [donations, applied])

  const applyFilters = () => setApplied({ search, status })
  const resetFilters = () => {
    setSearch(''); setStatus('All')
    setApplied({ search: '', status: 'All' })
  }

  const openApprove = (donation) => {
    setSelected(donation)
    setHospitalId('')
    setSchedDate(donation.availability_date || '')
    setSchedTime(donation.preferred_time || '')
    setModal('approve')
  }

  const openReject = (donation) => {
    setSelected(donation)
    setReason('')
    setModal('reject')
  }

  const closeModal = () => {
    setModal(null)
    setSelected(null)
  }

  const handleAction = async () => {
    if (!selected) return
    setConfirming(true)
    try {
      let data
      if (modal === 'approve') {
        if (!hospitalId || !schedDate || !schedTime) {
          toast('Please fill in all scheduling fields', { type: 'error' })
          setConfirming(false)
          return
        }
        data = await api.post('/admin/voluntary/approve.php', {
          donation_id: selected.id,
          hospital_id: hospitalId,
          scheduled_date: schedDate,
          scheduled_time: schedTime,
        })
      } else {
        if (!reason.trim()) {
          toast('Rejection reason is required', { type: 'error' })
          setConfirming(false)
          return
        }
        data = await api.post('/admin/voluntary/reject.php', {
          donation_id: selected.id,
          rejection_reason: reason,
        })
      }

      if (data.success) {
        toast(`Donation ${modal === 'approve' ? 'approved' : 'rejected'}.`, { type: 'success' })
        fetchDonations() // Refresh list
        closeModal()
      } else {
        toast(data.message || 'Action failed.', { type: 'error' })
      }
    } catch (err) {
      toast('Action failed.', { type: 'error' })
    } finally {
      setConfirming(false)
    }
  }

  const columns = [
    { key: 'donor', label: 'Donor Name' },
    { key: 'group', label: 'Blood Group' },
    { key: 'city', label: 'City' },
    { key: 'availability', label: 'Available From' },
    { key: 'scheduled', label: 'Scheduled Info' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ]

  const statCards = [
    { label: 'Total', value: stats?.total || 0, icon: Users, tone: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Approved', value: stats?.approved || 0, icon: CheckCircle, tone: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40' },
    { label: 'Pending', value: stats?.pending || 0, icon: Clock, tone: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Completed', value: stats?.completed || 0, icon: Calendar, tone: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voluntary Donations"
        subtitle="Manage and schedule voluntary blood donations from donors."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-md border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.tone}`} />
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <Button variant="secondary" onClick={() => setShowFilters((s) => !s)}>
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Search Donor or City"
              leftIcon={Search}
              placeholder="e.g. Rahim or Dhaka"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
            <Select
              label="Status"
              options={['All', 'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled']}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" size="sm" onClick={applyFilters}>Apply</Button>
            <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        data={loading ? [] : filtered}
        empty={loading ? 'Loading...' : 'No voluntary donations found.'}
        renderRow={(row) => (
          <>
            <Td className="font-medium text-gray-900 dark:text-slate-100">
              {row.donor_name}
              <div className="text-xs font-normal text-gray-500">{row.donor_phone}</div>
            </Td>
            <Td><BloodGroupBadge group={row.blood_type} size="sm" /></Td>
            <Td>{row.city}</Td>
            <Td>
              {row.availability_date}
              <div className="text-xs text-gray-500">{row.preferred_time || 'Any time'}</div>
            </Td>
            <Td>
              {row.hospital_name ? (
                <>
                  <div className="text-sm">{row.hospital_name}</div>
                  <div className="text-xs text-gray-500">
                    {row.scheduled_date} at {row.scheduled_time}
                  </div>
                </>
              ) : (
                <span className="text-xs italic text-gray-400">Not scheduled</span>
              )}
            </Td>
            <Td><Badge variant={STATUS_TONE[row.status] || 'neutral'} className="capitalize">{row.status}</Badge></Td>
            <Td className="text-right">
              {row.status === 'pending' && (
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openApprove(row)} className="text-green-600 hover:bg-green-50">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openReject(row)} className="text-red-600 hover:bg-red-50">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Td>
          </>
        )}
      />

      {/* Approve Modal */}
      <Modal
        open={modal === 'approve'}
        onClose={closeModal}
        title="Schedule Donation"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={confirming}>Cancel</Button>
            <Button variant="primary" onClick={handleAction} loading={confirming}>Schedule</Button>
          </>
        }
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Assign <span className="font-semibold">{selected?.donor_name}</span> to a hospital and confirm date/time.
          </p>
          <Select
            label="Hospital"
            options={[
              { value: '', label: 'Select Hospital...' },
              ...hospitals.map(h => ({ value: h.hospital_id, label: `${h.name} (${h.city})` }))
            ]}
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={schedDate}
            onChange={(e) => setSchedDate(e.target.value)}
          />
          <Input
            label="Time"
            type="time"
            value={schedTime}
            onChange={(e) => setSchedTime(e.target.value)}
          />
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={modal === 'reject'}
        onClose={closeModal}
        title="Reject Voluntary Donation"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={confirming}>Cancel</Button>
            <Button variant="danger" onClick={handleAction} loading={confirming}>Reject</Button>
          </>
        }
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Please provide a reason for rejecting <span className="font-semibold">{selected?.donor_name}</span>'s offer.
          </p>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection…"
            className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </Modal>
    </div>
  )
}
