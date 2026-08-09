import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MessageSquare, Phone, MapPin, ChevronRight, Activity, Calendar, Droplet } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { STATUS_COLORS, URGENCY_LEVELS } from '../../utils/constants'
import { api } from '../../utils/apiService'
import { useToast } from '../../components/ui/Toast'

export default function RequestDetails() {
  const { id } = useParams()
  const { toast } = useToast()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequestDetails()
  }, [id])

  const fetchRequestDetails = async () => {
    try {
      setLoading(true)
      const data = await api.get(`/seeker/request.php?id=${id}`)
      if (data.success) {
        setRequest(data.request)
      } else {
        toast(data.message || 'Failed to load request details', { type: 'error' })
      }
    } catch (err) {
      console.error(err)
      toast('An error occurred while loading request details', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
        <p className="text-gray-500 dark:text-gray-400">Request not found.</p>
        <Link to="/seeker/tracking" className="mt-4 inline-block text-red-600 hover:underline dark:text-red-400">
          Back to Tracking
        </Link>
      </div>
    )
  }

  const getProgress = (lifecycleStatus) => {
    switch (lifecycleStatus) {
      case 'pending': return 1;
      case 'approved': return 2;
      case 'donor_assigned':
      case 'on_the_way':
      case 'reached': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  }

  const progress = getProgress(request.lifecycle_status)
  
  // Format timeline
  const timeline = [
    { time: request.created_at, title: 'Request Submitted', desc: 'Request broadcasted.' }
  ]
  if (request.approved_at) {
    timeline.unshift({ time: request.approved_at, title: 'Searching Donor', desc: 'Request has been approved and broadcasted.' })
  }
  if (request.donation) {
    if (request.donation.accepted_at) {
      timeline.unshift({ time: request.donation.accepted_at, title: 'Donor Assigned', desc: `${request.donation.donor_name} accepted the request.` })
    }
    if (request.donation.started_at) {
      timeline.unshift({ time: request.donation.started_at, title: 'Donor On the Way', desc: 'Donor is on the way to the hospital.' })
    }
    if (request.donation.reached_at) {
      timeline.unshift({ time: request.donation.reached_at, title: 'Donor Reached', desc: 'Donor reached the hospital.' })
    }
    if (request.donation.completed_at) {
      timeline.unshift({ time: request.donation.completed_at, title: 'Completed', desc: 'Blood donation was successfully completed.' })
    }
  }

  const statusLabel = {
    pending: 'Under Admin Review',
    approved: 'Searching for Donor',
    in_progress: 'Donor Assigned',
    donor_assigned: 'Donor Assigned',
    on_the_way: 'Donor On the way',
    reached: 'Donor Reached',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected'
  }[request.lifecycle_status || request.status] || request.lifecycle_status

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/seeker/tracking" className="hover:text-red-600 dark:hover:text-red-400">My Requests</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900 dark:text-slate-200">{request.request_code}</span>
      </div>

      <div className="mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-gray-100 pb-6 dark:border-slate-700">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{request.request_code}</span>
              <Badge variant="primary" className="text-base px-3 py-1">{request.blood_type}</Badge>
              <Badge variant={STATUS_COLORS[request.status] || 'neutral'} className="capitalize text-sm px-3 py-1">{statusLabel}</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">Requested on {request.created_at?.split(' ')[0]}</p>
          </div>
          <div className="text-right">
            <div className="mb-2 flex items-center justify-end gap-3">
              <Badge variant={URGENCY_LEVELS[request.urgency]?.color || 'neutral'} dot>{URGENCY_LEVELS[request.urgency]?.label}</Badge>
              <span className="font-medium text-gray-900 dark:text-white">{request.quantity} Units</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-slate-200 flex items-center justify-end gap-1">
              <MapPin className="h-4 w-4 text-gray-400" /> {request.hospital_name}
            </p>
          </div>
        </div>

        {['cancelled', 'rejected'].includes(request.lifecycle_status || request.status) ? (
          <div className="pt-8 pb-4 text-center text-sm font-medium text-red-500">
            This request was {request.lifecycle_status || request.status}.
          </div>
        ) : (
          <div className="pt-8 pb-4">
            <div className="relative flex justify-between">
              <div className="absolute left-0 top-6 h-0.5 w-full -translate-y-1/2 border-t-2 border-dashed border-gray-200 dark:border-slate-700" />
              {['Submitted', 'Searching Donor', 'Donor Assigned', 'On the Way', 'Reached', 'Completed'].map((step, i) => {
                const stepNum = i + 1;
                const isPast = stepNum < progress;
                const isCurrent = stepNum === progress;
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center bg-white px-4 dark:bg-slate-800 w-1/6 text-center">
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${isPast ? 'bg-red-600 text-white' : isCurrent ? 'bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-900/50' : 'bg-gray-100 text-gray-400 dark:bg-slate-700'}`}>
                      {stepNum}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-medium leading-tight ${isCurrent ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>{step}</span>
                    {isCurrent && <span className="mt-1 text-[10px] text-gray-500 dark:text-gray-500">Current Phase</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-400" /> Patient Details
            </h3>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-slate-200">{request.patient_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                <p className="font-medium text-gray-900 dark:text-slate-200">{request.patient_age ? `${request.patient_age} Years` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Blood Group</p>
                <p className="font-medium text-gray-900 dark:text-slate-200">{request.blood_type}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Medical Reason</p>
                <p className="text-sm text-gray-900 dark:text-slate-200">{request.medical_reason || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" /> Request Details
            </h3>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Required By</p>
                <p className="font-medium text-gray-900 dark:text-slate-200">{request.required_date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Units Needed</p>
                <p className="font-medium text-gray-900 dark:text-slate-200">{request.quantity}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-sm text-gray-900 dark:text-slate-200">{request.city}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {request.donation && (
            <div className="rounded-md border border-red-200 bg-red-50 p-6 shadow-[var(--shadow-card)] dark:border-red-900/50 dark:bg-red-950/20">
              <h3 className="mb-4 text-lg font-semibold text-red-900 dark:text-red-300 flex items-center gap-2">
                <Droplet className="h-5 w-5 text-red-500" /> Assigned Donor
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-200 text-lg font-bold text-red-700 dark:bg-red-800 dark:text-red-100">
                    {request.donation.donor_name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">{request.donation.donor_name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <Badge variant="primary" size="sm">{request.donation.donor_blood_group}</Badge>
                      {request.donation.donor_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {request.donation.donor_phone}</span>}
                    </div>
                  </div>
                </div>
                <Link to="/seeker/chat">
                  <Button variant="primary">
                    <MessageSquare className="mr-2 h-4 w-4" /> Chat Now
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" /> Hospital Info
            </h3>
            <p className="font-medium text-gray-900 dark:text-slate-200">{request.hospital_name}</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              <Phone className="h-4 w-4 text-gray-400" /> {request.contact_phone}
            </p>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Activity Timeline</h3>
            <div className="space-y-6">
              {timeline.map((event, i) => (
                <div key={i} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:h-full before:w-0.5 before:bg-gray-200 last:before:hidden dark:before:bg-slate-700">
                  <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-white bg-red-600 dark:border-slate-800 dark:bg-red-500" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">{event.title}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{event.desc}</p>
                  <p className="mt-1 text-xs font-medium text-gray-400">{event.time?.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
