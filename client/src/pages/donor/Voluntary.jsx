import { useState, useEffect } from 'react'
import { CheckCircle, Calendar, Clock, MapPin, Droplet, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { DONATION_TYPES } from '../../utils/constants'
import { api } from '../../utils/apiService'

const EMPTY = {
  hospital_id: '',
  date: '',
  time: '',
  blood_group_id: '',
  notes: '',
}

export default function Voluntary() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [scheduled, setScheduled] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [cancelId, setCancelId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [apptsRes, hospRes] = await Promise.all([
        api.get('/donor/voluntary/list.php'),
        api.get('/donor/hospitals/list.php')
      ])
      
      if (apptsRes.success) {
        setAppointments(apptsRes.donations || [])
      }
      
      if (hospRes.success) {
        setHospitals(hospRes.hospitals || [])
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setInitialLoading(false)
    }
  }

  const update = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.hospital_id) next.hospital_id = 'Please select a hospital.'
    if (!form.date) next.date = 'Please choose a date.'
    if (!form.time) next.time = 'Please choose a time.'
    // if (!form.type) next.type = 'Please select a donation type.' // If the API doesn't take type, we skip it.
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})
    
    try {
      const payload = {
        hospital_id: form.hospital_id,
        availability_date: form.date,
        preferred_time: form.time,
        notes: form.notes
      }
      
      const data = await api.post('/donor/voluntary/submit.php', payload)
      if (data.success) {
        setScheduled({
          ...form,
          hospital_name: hospitals.find(h => h.id.toString() === form.hospital_id)?.hospital_name
        })
        fetchData() // Refresh list
      } else {
        setErrors({ general: data.message || 'Failed to schedule appointment.' })
      }
    } catch (err) {
      setErrors({ general: 'Network error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setForm(EMPTY)
    setErrors({})
    setScheduled(null)
  }

  const cancelAppointment = async () => {
    if (!cancelId) return
    setCancelling(true)
    try {
      const data = await api.post('/donor/voluntary/cancel.php', { voluntary_id: cancelId })
      if (data.success) {
        fetchData()
      }
    } catch (err) {
      console.error('Cancel error:', err)
    } finally {
      setCancelling(false)
      setCancelId(null)
    }
  }

  const hospitalOptions = hospitals.map(h => ({
    value: h.id,
    label: `${h.hospital_name} (${h.city})`
  }))

  if (initialLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donate Voluntarily"
        subtitle="Schedule a donation at a hospital near you."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* LEFT */}
        <div className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          {scheduled ? (
            <div className="flex flex-col items-center rounded-md bg-green-50 p-6 text-center dark:bg-green-950/30">
              <CheckCircle className="mb-3 h-12 w-12 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">
                Appointment scheduled!
              </h2>
              <p className="mt-1 text-sm text-green-600/80 dark:text-green-400/70">
                We have sent a confirmation to your registered contact.
              </p>
              <div className="mt-5 w-full space-y-2 rounded-md border border-green-200 bg-white p-4 text-left text-sm dark:border-green-900/50 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                  {scheduled.hospital_name}
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  {scheduled.date}
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  {scheduled.time}
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-5"
                onClick={reset}
              >
                Schedule another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-slate-100">
                Schedule a Voluntary Donation
              </h2>
              
              {errors.general && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40">
                  {errors.general}
                </div>
              )}

              <div className="space-y-4">
                <Select
                  label="Hospital"
                  name="hospital_id"
                  placeholder="Select a hospital"
                  options={hospitalOptions}
                  value={form.hospital_id}
                  onChange={update}
                  error={errors.hospital_id}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Date"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={update}
                    error={errors.date}
                  />
                  <Input
                    label="Time"
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={update}
                    error={errors.time}
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    name="notes"
                    value={form.notes}
                    onChange={update}
                    placeholder="Any special requirements or preferences"
                    className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                >
                  Schedule Donation
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
            My Upcoming Appointments
          </h2>
          {appointments.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
              No upcoming appointments.
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between rounded-md border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-slate-100">
                      {a.hospital_name || 'General Camp'}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {a.scheduled_date || a.availability_date}
                      <Clock className="ml-2 h-3.5 w-3.5" />
                      {a.scheduled_time || a.preferred_time || 'N/A'}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                      <Droplet className="h-3.5 w-3.5" />
                      {a.blood_type || 'Whole Blood'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={a.status === 'completed' ? 'success' : a.status === 'cancelled' ? 'neutral' : 'warning'}
                      className="capitalize"
                      dot
                    >
                      {a.status}
                    </Badge>
                    {(a.status === 'pending' || a.status === 'approved' || a.status === 'scheduled') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancelId(a.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel Appointment"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelId(null)}>Keep it</Button>
            <Button
              className="border-none bg-red-600 text-white hover:bg-red-700"
              onClick={cancelAppointment}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Yes, cancel'}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
          <p className="text-sm text-gray-700 dark:text-slate-300">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}
