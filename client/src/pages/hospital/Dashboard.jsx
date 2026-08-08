import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Droplet, ClipboardList, CalendarClock, Users, Plus, AlertTriangle, Check, X } from 'lucide-react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import PageHeader from '../../components/shared/PageHeader'
import StatCard from '../../components/shared/StatCard'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Table, { Td } from '../../components/ui/Table'
import { URGENCY_LEVELS, STATUS_COLORS } from '../../utils/constants'
import { api } from '../../utils/apiService'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

export default function HospitalDashboard() {
  const [requests, setRequests] = useState([])
  const [appointments, setAppointments] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [reqRes, aptRes, profRes] = await Promise.all([
        api.get('/hospital/requests.php'),
        api.get('/hospital/appointments.php'),
        api.get('/hospital/profile.php')
      ])

      if (reqRes.success) {
        setRequests(reqRes.requests || [])
      }
      if (aptRes.success) {
        setAppointments(aptRes.appointments || [])
      }
      if (profRes.success) {
        setProfile(profRes.profile)
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate dynamic stats
  const activeRequests = requests.filter(r => ['pending', 'in_progress', 'approved'].includes(r.status))
  
  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(a => {
    const aptDate = a.date || (a.history && a.history.length > 0 ? a.history[a.history.length - 1].date : null)
    return aptDate === today
  })

  // Simulated inventory levels (no real API for hospital inventory yet)
  const BLOOD_INVENTORY = [
    { group: 'A+', units: 45 },
    { group: 'A-', units: 12 },
    { group: 'B+', units: 58 },
    { group: 'B-', units: 8 },
    { group: 'AB+', units: 22 },
    { group: 'AB-', units: 5 },
    { group: 'O+', units: 84 },
    { group: 'O-', units: 14 },
  ]

  const collectionData = {
    labels: BLOOD_INVENTORY.map(b => b.group),
    datasets: [
      {
        label: 'Units in Stock',
        data: BLOOD_INVENTORY.map(b => b.units),
        backgroundColor: '#DC2626',
        borderRadius: 4,
      },
    ],
  }

  const collectionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.15)' } },
    },
  }

  const aptStatusCounts = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1
    return acc
  }, {})

  const appointmentData = {
    labels: ['Completed', 'Confirmed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [
          aptStatusCounts['Completed'] || 0,
          aptStatusCounts['Confirmed'] || 0,
          aptStatusCounts['Pending'] || 0,
          aptStatusCounts['Cancelled'] || 0
        ],
        backgroundColor: ['#16A34A', '#2563EB', '#F59E0B', '#DC2626'],
        borderWidth: 0,
      },
    ],
  }

  const appointmentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
  }

  const scheduleColumns = [
    { key: 'time', label: 'Time' },
    { key: 'donor', label: 'Donor' },
    { key: 'group', label: 'Blood Group' },
    { key: 'status', label: 'Status' },
  ]

  const columns = [
    { key: 'id', label: 'Request' },
    { key: 'patient', label: 'Patient' },
    { key: 'group', label: 'Group' },
    { key: 'units', label: 'Units' },
    { key: 'urgency', label: 'Urgency' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <div>
      <PageHeader
        title="Hospital Dashboard"
        subtitle={profile?.name || "Loading..."}
        actions={
          <Button as={Link} to="/hospital/requests">
            <Plus className="h-4 w-4" /> New request
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Active requests" value={activeRequests.length} />
        <StatCard icon={CalendarClock} label="Appointments today" value={todayAppointments.length} />
        <StatCard icon={Users} label="Total appointments" value={appointments.length} />
        <StatCard icon={Droplet} label="Total requests" value={requests.length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Inventory grid */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] lg:col-span-2 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">
            Blood stock levels (Estimated)
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BLOOD_INVENTORY.map((b) => {
              const low = b.units < 15
              return (
                <div
                  key={b.group}
                  className={`rounded-md border p-4 ${
                    low
                      ? 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30'
                      : 'border-gray-100 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <BloodGroupBadge group={b.group} size="sm" showIcon={false} />
                    {low && <AlertTriangle className="h-4 w-4 text-red-500" title="Low stock" />}
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {b.units}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">units</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Quick actions</h3>
          <div className="mt-4 flex flex-col gap-3">
            <Button as={Link} to="/hospital/requests" fullWidth>
              <ClipboardList className="h-4 w-4" /> Manage blood requests
            </Button>
            <Button as={Link} to="/hospital/donors" variant="secondary" fullWidth>
              <Users className="h-4 w-4" /> Search donor network
            </Button>
            <Button as={Link} to="/hospital/appointments" variant="secondary" fullWidth>
              <CalendarClock className="h-4 w-4" /> Manage appointments
            </Button>
          </div>
          <div className="mt-5 rounded-md bg-red-50 p-4 dark:bg-red-950/40">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              Check inventory alerts
            </p>
            <p className="mt-1 text-xs text-red-700 dark:text-red-300/80">
              Review stock levels closely to prepare for emergencies.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">
            Your recent requests
          </h3>
          <Button as={Link} to="/hospital/requests" size="sm" variant="secondary">View All</Button>
        </div>
        <Table
          columns={columns}
          data={requests.slice(0, 5)}
          empty={loading ? 'Loading...' : 'No requests found.'}
          renderRow={(r) => (
            <>
              <Td className="font-mono text-sm text-gray-900 dark:text-slate-100">{r.request_code}</Td>
              <Td>{r.patient_name}</Td>
              <Td>
                <BloodGroupBadge group={r.blood_type} size="sm" />
              </Td>
              <Td>{r.quantity}</Td>
              <Td>
                <Badge tone={URGENCY_LEVELS[r.urgency]?.color || 'gray'} dot>
                  {URGENCY_LEVELS[r.urgency]?.label || r.urgency}
                </Badge>
              </Td>
              <Td>
                <Badge tone={STATUS_COLORS[r.status]}>{r.status}</Badge>
              </Td>
            </>
          )}
        />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-white p-5 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-slate-100">
            Inventory Distribution
          </h3>
          <div className="h-72">
            <Bar data={collectionData} options={collectionOptions} />
          </div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-5 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-slate-100">
            Appointment Status
          </h3>
          <div className="h-72">
            <Doughnut data={appointmentData} options={appointmentOptions} />
          </div>
        </div>
      </div>

      {/* Today's schedule */}
      <div className="mt-6 rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">
            Recent Appointments
          </h3>
          <Button as={Link} to="/hospital/appointments" size="sm" variant="secondary">View All</Button>
        </div>
        <Table
          columns={scheduleColumns}
          data={appointments.slice(0, 5)}
          empty={loading ? 'Loading...' : 'No appointments scheduled.'}
          renderRow={(s) => (
            <>
              <Td className="font-medium text-gray-900 dark:text-slate-100">{s.time || s.preferred_time || 'N/A'}</Td>
              <Td>{s.donor?.name || 'Unknown Donor'}</Td>
              <Td>
                <BloodGroupBadge group={s.donor?.blood_group} size="sm" />
              </Td>
              <Td>
                <Badge tone={STATUS_COLORS[s.status] || 'gray'}>
                  {s.status}
                </Badge>
              </Td>
            </>
          )}
        />
      </div>
    </div>
  )
}
