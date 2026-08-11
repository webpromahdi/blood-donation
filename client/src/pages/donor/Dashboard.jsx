import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import {
  Droplet,
  HeartPulse,
  Award,
  CalendarClock,
  MapPin,
  ArrowRight,
  AlertCircle,
  Check,
  Navigation,
  Heart,
  Activity,
  Building2,
  User,
  Phone,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import StatCard from '../../components/shared/StatCard'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/apiService'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const DONATION_STATES = {
  ACCEPTED: 'accepted',
  ON_THE_WAY: 'on_the_way',
  REACHED: 'reached',
  COMPLETED: 'completed',
}

const STATE_ORDER = [
  DONATION_STATES.ACCEPTED,
  DONATION_STATES.ON_THE_WAY,
  DONATION_STATES.REACHED,
  DONATION_STATES.COMPLETED,
]

const STEP_CONFIG = [
  { icon: Check, label: 'Accepted' },
  { icon: Navigation, label: 'On the Way' },
  { icon: MapPin, label: 'Reached' },
  { icon: Heart, label: 'Completed' },
]

const NEXT_BTN_LABELS = {
  [DONATION_STATES.ACCEPTED]: 'Start Journey',
  [DONATION_STATES.ON_THE_WAY]: "I've Arrived",
  [DONATION_STATES.REACHED]: 'Complete Donation',
}

const STATUS_MESSAGES = {
  [DONATION_STATES.ACCEPTED]: 'Accepted - Please proceed to the hospital.',
  [DONATION_STATES.ON_THE_WAY]: 'On the Way - You are traveling to the hospital.',
  [DONATION_STATES.REACHED]: 'Reached Location - Awaiting donation process.',
  [DONATION_STATES.COMPLETED]: 'Donation Completed - Thank you for saving a life!',
}

export default function DonorDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [stats, setStats] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeDonation, setActiveDonation] = useState(null)
  const [donationState, setDonationState] = useState(null)
  const [history, setHistory] = useState([])
  const [camps, setCamps] = useState([])
  const [availableRequests, setAvailableRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [cancellingDonation, setCancellingDonation] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [acceptingId, setAcceptingId] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/donor/profile.php'),
      api.get('/donor/history.php'),
      api.get('/donor/voluntary/list.php'),
      api.get('/donor/requests.php'),
    ])
      .then(([profileRes, historyRes, campsRes, reqRes]) => {
        if (profileRes.success) {
          setStats(profileRes.stats)
          if (profileRes.profile) setProfile(profileRes.profile)
          if (profileRes.active_donation) {
            setActiveDonation(profileRes.active_donation)
            setDonationState(profileRes.active_donation.status)
          }
        }
        if (historyRes.success) setHistory(historyRes.donations || [])
        if (campsRes.success) setCamps(campsRes.donations || [])
        if (reqRes.success) {
          const all = [
            ...(reqRes.emergency_requests || []).map(r => ({ ...r, urgency: 'emergency' })),
            ...(reqRes.normal_requests || []).map(r => ({ ...r, urgency: 'normal' })),
          ]
          setAvailableRequests(all)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const openRequestModal = (req) => {
    setSelectedRequest(req)
    setModalOpen(true)
  }

  const handleAcceptRequest = async (requestId) => {
    setAcceptingId(requestId)
    try {
      const res = await api.post('/donor/requests/accept.php', { request_id: requestId })
      if (res.success) {
        setModalOpen(false)
        const profileRes = await api.get('/donor/profile.php')
        if (profileRes.success && profileRes.active_donation) {
          setActiveDonation(profileRes.active_donation)
          setDonationState(profileRes.active_donation.status)
        }
        setAvailableRequests([])
        toast('Please proceed to the hospital.', { title: 'Request accepted!', type: 'success' })
      } else {
        toast(res.message || 'Could not accept the request.', { title: 'Failed', type: 'error' })
      }
    } catch (err) {
      toast(err?.message || 'Network error. Please try again.', { title: 'Error', type: 'error' })
    } finally {
      setAcceptingId(null)
    }
  }

  const handleAdvanceStatus = async () => {
    if (!activeDonation || donationState === DONATION_STATES.COMPLETED) return
    const currentIdx = STATE_ORDER.indexOf(donationState)
    if (currentIdx < 0 || currentIdx >= STATE_ORDER.length - 1) return
    const nextState = STATE_ORDER[currentIdx + 1]
    setUpdatingStatus(true)
    try {
      const res = await api.post('/donor/donations/update.php', {
        donation_id: activeDonation.id,
        status: nextState,
      })
      if (res.success) {
        setDonationState(nextState)
        toast(STATUS_MESSAGES[nextState], { title: 'Status updated!', type: 'success' })
      } else {
        toast(res.message || 'Could not update status.', { title: 'Failed', type: 'error' })
      }
    } catch (err) {
      toast(err?.message || 'Network error.', { title: 'Error', type: 'error' })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleCancelDonation = async () => {
    if (!activeDonation) return
    if (donationState === DONATION_STATES.COMPLETED) {
      setActiveDonation(null)
      setDonationState(null)
      const reqRes = await api.get('/donor/requests.php')
      if (reqRes.success) {
        const all = [
          ...(reqRes.emergency_requests || []).map(r => ({ ...r, urgency: 'emergency' })),
          ...(reqRes.normal_requests || []).map(r => ({ ...r, urgency: 'normal' })),
        ]
        setAvailableRequests(all)
      }
      return
    }
    setCancellingDonation(true)
    try {
      const res = await api.post('/donor/donations/cancel.php', { donation_id: activeDonation.id })
      if (res.success) {
        setActiveDonation(null)
        setDonationState(null)
        toast('You can accept a new request.', { title: 'Donation cancelled', type: 'info' })
        const reqRes = await api.get('/donor/requests.php')
        if (reqRes.success) {
          const all = [
            ...(reqRes.emergency_requests || []).map(r => ({ ...r, urgency: 'emergency' })),
            ...(reqRes.normal_requests || []).map(r => ({ ...r, urgency: 'normal' })),
          ]
          setAvailableRequests(all)
        }
      } else {
        toast(res.message || 'Could not cancel donation.', { title: 'Failed', type: 'error' })
      }
    } catch (err) {
      toast(err?.message || 'Network error.', { title: 'Error', type: 'error' })
    } finally {
      setCancellingDonation(false)
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A'
    const diff = Date.now() - new Date(isoString)
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return mins + 'm ago'
    if (mins < 1440) return Math.floor(mins / 60) + 'h ago'
    return Math.floor(mins / 1440) + 'd ago'
  }

  const emergencyRequests = availableRequests.filter(r => r.urgency === 'emergency')
  const normalRequests = availableRequests.filter(r => r.urgency !== 'emergency')
  const currentStateIdx = donationState ? STATE_ORDER.indexOf(donationState) : -1
  const isCompleted = donationState === DONATION_STATES.COMPLETED

  const chartData = {
    labels: ['2022', '2023', '2024', '2025', '2026'],
    datasets: [{
      data: [2, 3, 3, 4, stats?.total_donations || 0],
      borderColor: '#dc2626',
      backgroundColor: (ctx) => {
        const { ctx: c, chartArea } = ctx.chart
        if (!chartArea) return 'rgba(220,38,38,0.1)'
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        g.addColorStop(0, 'rgba(220,38,38,0.25)')
        g.addColorStop(1, 'rgba(220,38,38,0)')
        return g
      },
      fill: true, tension: 0.4, pointBackgroundColor: '#dc2626', pointRadius: 4,
    }],
  }

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.15)' }, ticks: { precision: 0 } },
      x: { grid: { display: false } },
    },
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} `}
        subtitle="Here's your donation impact at a glance."
        actions={<Button as={Link} to="/donor/voluntary"><CalendarClock className="h-4 w-4" /> Book a donation</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={HeartPulse} label="Total Donations" value={stats?.total_donations || 0} />
        <StatCard icon={Award} label="Lives Saved (Est.)" value={stats?.lives_saved || stats?.total_donations || 0} />
        <StatCard 
          icon={CalendarClock} 
          label="Next Eligible Date" 
          value={(!stats || stats.is_eligible) ? 'Ready' : new Date(stats.next_eligible).toLocaleDateString()} 
          disableAnimation={true}
        />
        <StatCard icon={Droplet} label="Blood Group" value={profile?.blood_group || user?.blood_group || 'N/A'} />
      </div>

      {/* Active Donation Tracker */}
      {activeDonation && donationState && (
        <div className="mt-6 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-white p-6 shadow-sm dark:border-green-900/30 dark:from-green-950/20 dark:to-slate-900">
          <div className="mb-5 flex items-start gap-4">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/40">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">My Active Donation</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">You have an active donation in progress</p>
            </div>
          </div>
          <div className="mb-5 flex items-center gap-4 rounded-lg border border-green-200 bg-white p-4 dark:border-green-900/30 dark:bg-slate-800">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <Droplet className="h-6 w-6 fill-green-600 text-green-600 dark:fill-green-400 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-slate-100">{activeDonation.hospital_name}</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Blood Type: {activeDonation.blood_type} &bull; {activeDonation.quantity} unit(s) &bull; {formatTime(activeDonation.accepted_at)}
              </p>
            </div>
            <Badge variant={activeDonation.urgency === 'emergency' ? 'danger' : 'primary'}>
              {activeDonation.urgency === 'emergency' ? 'Critical' : 'Scheduled'}
            </Badge>
          </div>

          <div className="mb-5">
            <p className="mb-3 text-sm font-medium text-gray-600 dark:text-slate-400">Donation Progress</p>
            <div className="relative flex justify-between">
              {/* Background lines */}
              <div className="absolute left-[20px] right-[20px] top-5 h-1 -translate-y-1/2 bg-gray-200 dark:bg-slate-700" />
              <div 
                className="absolute left-[20px] top-5 h-1 -translate-y-1/2 bg-green-500 transition-all duration-300" 
                style={{ width: `calc(${(Math.max(0, currentStateIdx) / (STEP_CONFIG.length - 1)) * 100}% - 40px)` }} 
              />
              
              {STEP_CONFIG.map((step, i) => {
                const isDone = i < currentStateIdx
                const isCurrent = i === currentStateIdx
                const StepIcon = step.icon
                return (
                  <div key={i} className="relative z-10 flex flex-col items-center w-16">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900/60' : 'bg-gray-200 text-gray-400 dark:bg-slate-700 dark:text-slate-500'}`}>
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <span className={`mt-2 text-center text-[11px] sm:text-xs leading-tight ${isCurrent ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={`mb-4 flex items-center gap-3 rounded-lg border p-4 ${isCompleted ? 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20' : 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20'}`}>
            {isCompleted ? <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" /> : <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />}
            <p className={`text-sm font-medium ${isCompleted ? 'text-green-800 dark:text-green-300' : 'text-blue-800 dark:text-blue-300'}`}>{STATUS_MESSAGES[donationState]}</p>
          </div>

          <div className="flex gap-3">
            {!isCompleted && (
              <Button onClick={handleAdvanceStatus} disabled={updatingStatus} className="border-none bg-green-600 text-white hover:bg-green-700" size="sm">
                <Navigation className="h-4 w-4" />
                {updatingStatus ? 'Updating...' : NEXT_BTN_LABELS[donationState]}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleCancelDonation} disabled={cancellingDonation}>
              {isCompleted ? 'Back to Dashboard' : cancellingDonation ? 'Cancelling...' : 'Cancel Donation'}
            </Button>
          </div>
        </div>
      )}

      {/* Emergency Requests */}
      {!activeDonation && stats?.is_eligible && emergencyRequests.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-6 shadow-sm dark:border-red-900/30 dark:from-red-950/20 dark:to-slate-900">
          <div className="mb-4 flex items-start gap-4">
            <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/50"><AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
            <div className="flex-1">
              <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-red-100">Emergency Requests Matching Your Blood Type</h2>
              <p className="text-gray-600 dark:text-red-200/70">Patients in your area need your help urgently.</p>
            </div>
          </div>
          <div className="space-y-3">
            {emergencyRequests.map(req => (
              <div key={req.id} className="flex flex-col justify-between gap-4 rounded-lg border border-red-200 bg-white p-4 sm:flex-row sm:items-center dark:border-red-900/30 dark:bg-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                    <Droplet className="h-6 w-6 fill-red-600 text-red-600 dark:fill-red-400 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-slate-100">{req.hospital_name}</h3>
                      <Badge variant="danger">Critical</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Blood Type: <strong>{req.blood_type}</strong> &bull; {formatTime(req.created_at)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => openRequestModal(req)}>View Details</Button>
                  <Button size="sm" className="border-none bg-red-600 text-white hover:bg-red-700" onClick={() => handleAcceptRequest(req.id)} disabled={acceptingId === req.id}>
                    {acceptingId === req.id ? 'Accepting...' : 'Accept'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Normal Requests */}
      {!activeDonation && stats?.is_eligible && normalRequests.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-6 shadow-sm dark:border-blue-900/30 dark:from-blue-950/20 dark:to-slate-900">
          <div className="mb-4 flex items-start gap-4">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/50"><CalendarClock className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
            <div className="flex-1">
              <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-blue-100">Non-Emergency Requests Matching Your Blood Type</h2>
              <p className="text-gray-600 dark:text-blue-200/70">Routine blood requests from hospitals in your area.</p>
            </div>
          </div>
          <div className="space-y-3">
            {normalRequests.map(req => (
              <div key={req.id} className="flex flex-col justify-between gap-4 rounded-lg border border-blue-200 bg-white p-4 sm:flex-row sm:items-center dark:border-blue-900/30 dark:bg-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-slate-100">{req.hospital_name}</h3>
                      <Badge tone="blue">Routine &bull; {req.quantity} units</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Blood Type: <strong>{req.blood_type}</strong> &bull; {formatTime(req.created_at)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => openRequestModal(req)}>View Details</Button>
                  <Button size="sm" className="border-none bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleAcceptRequest(req.id)} disabled={acceptingId === req.id}>
                    {acceptingId === req.id ? 'Accepting...' : 'Accept'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] lg:col-span-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">Donations over time</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Your yearly contribution</p>
            </div>
            <BloodGroupBadge group={profile?.blood_group || user?.blood_group || 'N/A'} />
          </div>
          <div className="mt-6 h-64"><Line data={chartData} options={chartOptions} /></div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Eligibility status</h3>
          <div className="mt-5 flex flex-col items-center text-center">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 ${(!stats || stats.is_eligible) ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-amber-500 text-amber-600 dark:text-amber-400'}`}>
              <span className="text-2xl font-bold">{(!stats || stats.is_eligible) ? 'Ready' : 'Wait'}</span>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-slate-300">
              {(!stats || stats.is_eligible) ? 'You are eligible to donate today.' : `You can donate in ${stats.days_until_eligible} days.`}
            </p>
            <div className="mt-4 w-full space-y-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Last donation</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">
                  {(!stats?.last_donation || stats.last_donation.startsWith('0000')) ? 'Never' : new Date(stats.last_donation).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Weight</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{profile?.weight || user?.weight || 'N/A'} kg</span>
              </div>
            </div>
            <Button as={Link} to="/donor/health" variant="outline" size="sm" fullWidth className="mt-5">View health details</Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">Recent donations</h3>
            <Link to="/donor/history" className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">All <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <ul className="mt-4 divide-y divide-gray-100 dark:divide-slate-700">
            {history.length > 0 ? history.slice(0, 4).map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300">
                    <Droplet className="h-4 w-4" fill="currentColor" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{d.donation_type === 'voluntary' ? 'Voluntary Camp' : 'Direct Request'}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{d.hospital || d.camp_name || 'General'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(d.completed_at || d.created_at).toLocaleDateString()}</p>
                  <Badge tone="green" dot>{d.status}</Badge>
                </div>
              </li>
            )) : <li className="py-4 text-center text-sm text-gray-500">No recent donations.</li>}
          </ul>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">Upcoming camps</h3>
            <Link to="/donor/voluntary" className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">All <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <ul className="mt-4 space-y-3">
            {camps.length > 0 ? camps.slice(0, 3).map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-md border border-gray-100 p-3 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{c.hospital_name || 'General Camp'}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3" /> {c.city || 'N/A'} &middot; {new Date(c.scheduled_date || c.availability_date).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" variant="secondary" as={Link} to="/donor/voluntary">View</Button>
              </li>
            )) : <li className="py-4 text-center text-sm text-gray-500">No upcoming appointments.</li>}
          </ul>
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Blood Request Details"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
              <Button
                className={`border-none text-white ${selectedRequest.urgency === 'emergency' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={() => handleAcceptRequest(selectedRequest.id)}
                disabled={!!acceptingId}
              >
                <CheckCircle className="h-4 w-4" />
                {acceptingId ? 'Accepting...' : 'Accept Request'}
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${selectedRequest.urgency === 'emergency' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                <Building2 className={`h-7 w-7 ${selectedRequest.urgency === 'emergency' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{selectedRequest.hospital_name}</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">{selectedRequest.city}</p>
                <p className={`text-sm font-medium ${selectedRequest.urgency === 'emergency' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {selectedRequest.urgency === 'emergency' ? 'Emergency Request' : 'Routine Request'}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
              <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Patient Information
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-500">Patient Name</p>
                  <p className="font-medium text-gray-900 dark:text-slate-100">{selectedRequest.patient_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-500">Age</p>
                  <p className="font-medium text-gray-900 dark:text-slate-100">{selectedRequest.patient_age ? selectedRequest.patient_age + ' yrs' : 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-slate-500">Contact Phone</p>
                  <p className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-slate-100">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {selectedRequest.contact_phone || selectedRequest.requester_phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Blood Type Required', value: selectedRequest.blood_type },
                { label: 'Units Needed', value: (selectedRequest.quantity || 1) + ' unit(s)' },
                { label: 'Required By', value: selectedRequest.required_date ? new Date(selectedRequest.required_date).toLocaleDateString() : 'N/A' },
                { label: 'Requested', value: formatTime(selectedRequest.created_at) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-gray-50 p-3 dark:bg-slate-700/50">
                  <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
                  <p className="mt-0.5 font-semibold text-gray-900 dark:text-slate-100">{value}</p>
                </div>
              ))}
            </div>
            {selectedRequest.medical_reason && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-slate-700/50">
                <p className="text-xs text-gray-500 dark:text-slate-400">Medical Reason</p>
                <p className="mt-0.5 text-sm text-gray-700 dark:text-slate-300">{selectedRequest.medical_reason}</p>
              </div>
            )}
            <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-950/20">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Important Note</p>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-500/90">By accepting this request, you confirm that you are currently healthy and willing to donate blood at the specified hospital.</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
