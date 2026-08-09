import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Check, X, Calendar as CalendarIcon } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Table, { Td } from '../../components/ui/Table'
import { useToast } from '../../components/ui/Toast'
import { BLOOD_GROUPS } from '../../utils/constants'
import { api } from '../../utils/apiService'

const STATUS_VARIANT = {
  Pending: 'warning',
  Scheduled: 'info',
  Confirmed: 'info',
  'In Progress': 'info',
  Completed: 'success',
  Cancelled: 'neutral',
}

export default function Appointments() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [bloodGroup, setBloodGroup] = useState('All')
  const [status, setStatus] = useState('All')
  const [search, setSearch] = useState('')


  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const data = await api.get('/hospital/appointments.php')
      if (data.success) {
        setAppointments(data.appointments || [])
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
      toast('Failed to load appointments', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const aptDate = a.date || (a.history && a.history.length > 0 ? a.history[a.history.length - 1].date : '')
      if (fromDate && aptDate < fromDate) return false
      if (toDate && aptDate > toDate) return false
      if (bloodGroup !== 'All' && a.donor?.blood_group !== bloodGroup) return false
      if (status !== 'All' && a.status !== status) return false
      if (search.trim() && a.donor?.name && !a.donor.name.toLowerCase().includes(search.trim().toLowerCase()))
        return false
      return true
    })
  }, [appointments, fromDate, toDate, bloodGroup, status, search])

  const setStatusFor = async (apt, nextStatus) => {
    try {
      const res = await api.put('/hospital/appointments.php', {
        id: apt.id,
        status: nextStatus
      })

      if (res.success) {
        setAppointments((list) =>
          list.map((a) => (a.id === apt.id ? { ...a, status: nextStatus === 'completed' ? 'Completed' : 'Cancelled' } : a))
        )
        toast(`Appointment marked as ${nextStatus === 'completed' ? 'Completed' : 'Cancelled'}.`, {
          type: nextStatus === 'cancelled' ? 'warning' : 'success',
        })
      } else {
        toast(res.message || 'Failed to update status', { type: 'error' })
      }
    } catch (err) {
      console.error(err)
      toast('An error occurred', { type: 'error' })
    }
  }



  const columns = [
    { key: 'donor', label: 'Donor Info' },
    { key: 'group', label: 'Group' },
    { key: 'time', label: 'Date & Time' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        subtitle="Manage scheduled donations and confirm arrivals."
      />

      <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          <Input
            placeholder="Search donor..."
            leftIcon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            type="date"
            placeholder="From Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            type="date"
            placeholder="To Date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Select
            options={['All', ...BLOOD_GROUPS]}
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          />
          <Select
            options={['All', 'Pending', 'Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled']}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={loading ? [] : filtered}
        empty={loading ? 'Loading...' : 'No appointments found.'}
        renderRow={(a) => {
          const aptDate = a.date || (a.history && a.history.length > 0 ? a.history[a.history.length - 1].date : 'Unknown Date')
          const aptTime = a.time || a.preferred_time || 'N/A'
          return (
            <>
              <Td>
                <div className="font-medium text-gray-900 dark:text-slate-100">
                  {a.donor?.name || 'Unknown Donor'}
                </div>
                <div className="text-xs text-gray-500">
                  {a.id} • {a.source}
                </div>
              </Td>
              <Td>
                <BloodGroupBadge group={a.donor?.blood_group} size="sm" showIcon={false} />
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {aptDate}
                    </div>
                    <div className="text-xs text-gray-500">{aptTime}</div>
                  </div>
                </div>
              </Td>
              <Td>
                <div className="text-sm text-gray-900 dark:text-slate-100">
                  {a.type || 'Whole Blood'}
                </div>
                {a.notes && (
                  <div className="max-w-[150px] truncate text-xs text-gray-500" title={a.notes}>
                    {a.notes}
                  </div>
                )}
              </Td>
              <Td>
                <Badge tone={STATUS_VARIANT[a.status] || 'neutral'}>{a.status}</Badge>
              </Td>
              <Td>
                <div className="flex items-center justify-end gap-2">
                  {['Scheduled', 'Confirmed', 'Pending', 'In Progress'].includes(a.status) && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setStatusFor(a, 'completed')}
                        className="text-green-600 hover:bg-green-50"
                        title="Mark Completed"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setStatusFor(a, 'cancelled')}
                        className="text-red-600 hover:bg-red-50"
                        title="Cancel Appointment"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </Td>
            </>
          )
        }}
      />
    </div>
  )
}
