import { useMemo, useState, useEffect } from 'react'
import {
  ClipboardList,
  Clock,
  CheckCircle,
  X,
  Eye,
  Check,
  Plus
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import StatCard from '../../components/shared/StatCard'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table, { Td } from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { BLOOD_GROUPS } from '../../utils/constants'
import { api } from '../../utils/apiService'

// Which donor blood groups are compatible for each recipient group.
const COMPATIBLE_DONORS = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
}

const URGENCY_BADGE = {
  emergency: 'danger',
  urgent: 'warning',
  normal: 'success',
}

const STATUS_BADGE = {
  pending: 'warning',
  in_progress: 'info',
  approved: 'info',
  completed: 'success',
  rejected: 'danger',
}

export default function Requests() {
  const { toast } = useToast()
  
  const [requests, setRequests] = useState([])
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)

  const [group, setGroup] = useState('All')
  const [urgency, setUrgency] = useState('All')
  const [status, setStatus] = useState('All')
  const [dateFilter, setDateFilter] = useState('')

  const [activeRequest, setActiveRequest] = useState(null)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [assigning, setAssigning] = useState(false)

  // Create Request State
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    patientName: '',
    patientAge: '',
    contactPhone: '',
    email: '',
    bloodType: BLOOD_GROUPS[0],
    quantity: 1,
    city: '',
    requiredDate: '',
    medicalReason: '',
    emergency: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reqRes, donorRes] = await Promise.all([
        api.get('/hospital/requests.php'),
        api.get('/hospital/donors.php?available=true')
      ])
      if (reqRes.success) setRequests(reqRes.requests || [])
      if (donorRes.success) setDonors(donorRes.donors || [])
    } catch (err) {
      console.error('Failed to load data:', err)
      toast('Failed to load requests data', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (group !== 'All' && r.blood_type !== group) return false
      if (urgency !== 'All' && r.urgency !== urgency.toLowerCase()) return false
      if (status !== 'All' && r.status !== status.toLowerCase()) return false
      if (dateFilter && r.created_at?.startsWith(dateFilter)) return false
      return true
    })
  }, [requests, group, urgency, status, dateFilter])

  const compatibleDonors = useMemo(() => {
    if (!activeRequest) return []
    const groups = COMPATIBLE_DONORS[activeRequest.blood_type] || [activeRequest.blood_type]
    return donors.filter((d) => d.is_available && groups.includes(d.blood_group))
  }, [activeRequest, donors])

  const openFulfill = (request) => {
    setActiveRequest(request)
    setSelectedDonor(null)
  }

  const closeFulfill = () => {
    setActiveRequest(null)
    setSelectedDonor(null)
    setAssigning(false)
  }

  const confirmAssign = async () => {
    if (!selectedDonor) return
    setAssigning(true)
    
    try {
      const res = await api.post('/hospital/requests/assign.php', {
        request_id: activeRequest.id,
        donor_id: selectedDonor
      })
      
      if (res.success) {
        const donor = compatibleDonors.find((d) => d.id === selectedDonor)
        setRequests(reqs => reqs.map(r => r.id === activeRequest.id ? { ...r, status: 'in_progress', donation: { donor_name: donor.name } } : r))
        toast(`${donor?.name} assigned to ${activeRequest.request_code}.`, { type: 'success' })
        closeFulfill()
      } else {
        toast(res.message || 'Failed to assign donor', { type: 'error' })
      }
    } catch (err) {
      console.error(err)
      toast('An error occurred during assignment', { type: 'error' })
    } finally {
      setAssigning(false)
    }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    setCreating(true)
    
    try {
      const data = await api.post('/hospital/requests/create.php', createForm)
      if (data.success) {
        toast('Blood request created successfully', { type: 'success' })
        setCreateModalOpen(false)
        setCreateForm({
          patientName: '', patientAge: '', contactPhone: '', email: '',
          bloodType: BLOOD_GROUPS[0], quantity: 1, city: '',
          requiredDate: '', medicalReason: '', emergency: false
        })
        fetchData()
      } else {
        toast(data.message || 'Failed to create request', { type: 'error' })
      }
    } catch (err) {
      toast('Error creating request', { type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  const columns = [
    { key: 'id', label: 'Request ID' },
    { key: 'patient', label: 'Patient Name' },
    { key: 'group', label: 'Blood Group' },
    { key: 'units', label: 'Units' },
    { key: 'urgency', label: 'Urgency' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Required Date' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ]

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    fulfilled: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Requests"
        subtitle="Manage your hospital's blood requests."
        actions={
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" /> Create Request
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Total Requests" value={stats.total} />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pending}
          iconBg="bg-amber-50 dark:bg-amber-950/50"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Fulfilled"
          value={stats.fulfilled}
          iconBg="bg-green-50 dark:bg-green-950/50"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={X}
          label="Rejected"
          value={stats.rejected}
          iconBg="bg-gray-100 dark:bg-slate-700"
          iconColor="text-gray-600 dark:text-slate-300"
        />
      </div>

      {/* Filter bar */}
      <div className="rounded-md border border-gray-200 bg-white p-5 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Request date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <Select
            label="Blood group"
            options={['All', ...BLOOD_GROUPS]}
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          />
          <Select
            label="Urgency"
            options={['All', 'Emergency', 'Urgent', 'Normal']}
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          />
          <Select
            label="Status"
            options={['All', 'Pending', 'In Progress', 'Completed', 'Rejected']}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
      </div>

      {/* Requests table */}
      <div className="rounded-md border border-gray-200 bg-white p-5 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
        <Table
          columns={columns}
          data={loading ? [] : filtered}
          empty={loading ? 'Loading...' : 'No blood requests found.'}
          renderRow={(r) => {
            const canFulfill = r.status === 'pending'
            return (
              <>
                <Td className="font-mono text-sm text-gray-900 dark:text-slate-100">{r.request_code}</Td>
                <Td>{r.patient_name}</Td>
                <Td>
                  <BloodGroupBadge group={r.blood_type} size="sm" />
                </Td>
                <Td>{r.quantity}</Td>
                <Td>
                  <Badge tone={URGENCY_BADGE[r.urgency] || 'gray'} dot className="capitalize">
                    {r.urgency}
                  </Badge>
                </Td>
                <Td>
                  <Badge tone={STATUS_BADGE[r.status] || 'gray'} className="capitalize">{r.status}</Badge>
                </Td>
                <Td>{r.required_date}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    {canFulfill && (
                      <Button size="sm" onClick={() => openFulfill(r)}>
                        <Check className="h-4 w-4" /> Match Donor
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="View request"
                      onClick={() =>
                        toast(`Viewing ${r.request_code}`, { type: 'info' })
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </Td>
              </>
            )
          }}
        />
      </div>

      {/* Fulfill Request modal */}
      <Modal
        open={!!activeRequest}
        onClose={closeFulfill}
        title="Fulfill Request"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeFulfill}>
              Cancel
            </Button>
            <Button
              onClick={confirmAssign}
              disabled={!selectedDonor}
              loading={assigning}
            >
              Confirm &amp; Assign
            </Button>
          </>
        }
      >
        {activeRequest && (
          <div className="space-y-4 pt-2">
            {/* Request summary */}
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-slate-400">Request ID</span>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">
                    {activeRequest.request_code}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400">Blood group</span>
                  <div className="mt-1">
                    <BloodGroupBadge group={activeRequest.blood_type} size="sm" />
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400">Units</span>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">
                    {activeRequest.quantity}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400">Urgency</span>
                  <div className="mt-1 capitalize">
                    <Badge tone={URGENCY_BADGE[activeRequest.urgency]} dot>
                      {activeRequest.urgency}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                Compatible available donors ({compatibleDonors.length})
              </p>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {compatibleDonors.length === 0 ? (
                  <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-slate-600 dark:text-slate-400">
                    No compatible donors available right now.
                  </p>
                ) : (
                  compatibleDonors.map((d) => {
                    const selected = selectedDonor === d.id
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDonor(d.id)}
                        className={`flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                          selected
                            ? 'border-red-500 bg-red-50 ring-1 ring-red-500 dark:bg-red-950/30'
                            : 'border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/40'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? 'border-red-600 bg-red-600'
                              : 'border-gray-300 dark:border-slate-500'
                          }`}
                        >
                          {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-slate-100">
                            {d.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {d.city} · {d.total_donations} donations
                          </p>
                        </div>
                        <BloodGroupBadge group={d.blood_group} size="sm" />
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Request Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => !creating && setCreateModalOpen(false)}
        title="Create Blood Request"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateRequest} loading={creating}>
              Submit Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 pt-4">
          <Input
            label="Patient Name"
            required
            value={createForm.patientName}
            onChange={(e) => setCreateForm({ ...createForm, patientName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Blood Group"
              options={BLOOD_GROUPS}
              value={createForm.bloodType}
              onChange={(e) => setCreateForm({ ...createForm, bloodType: e.target.value })}
            />
            <Input
              label="Units Required"
              type="number"
              min="1"
              required
              value={createForm.quantity}
              onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Patient Age"
              type="number"
              value={createForm.patientAge}
              onChange={(e) => setCreateForm({ ...createForm, patientAge: e.target.value })}
            />
            <Input
              label="Contact Phone"
              required
              value={createForm.contactPhone}
              onChange={(e) => setCreateForm({ ...createForm, contactPhone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input
              label="City"
              required
              value={createForm.city}
              onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
            />
            <Input
              label="Required By Date"
              type="date"
              required
              value={createForm.requiredDate}
              onChange={(e) => setCreateForm({ ...createForm, requiredDate: e.target.value })}
            />
          </div>
          <div className="space-y-1">
             <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
               Medical Reason (Optional)
             </label>
             <textarea
               className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
               rows={2}
               value={createForm.medicalReason}
               onChange={(e) => setCreateForm({ ...createForm, medicalReason: e.target.value })}
             />
          </div>
          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="emergency-flag"
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              checked={createForm.emergency}
              onChange={(e) => setCreateForm({ ...createForm, emergency: e.target.checked })}
            />
            <label htmlFor="emergency-flag" className="ml-2 block text-sm font-medium text-red-600">
              Mark as Emergency
            </label>
          </div>
        </form>
      </Modal>
    </div>
  )
}
