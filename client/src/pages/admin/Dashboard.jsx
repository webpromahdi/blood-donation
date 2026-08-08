import { useState, useEffect } from 'react'
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
import {
  Users,
  Droplet,
  Building2,
  Activity,
  Download,
  CheckCircle,
  Megaphone,
  BarChart2,
  AlertTriangle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/shared/PageHeader'
import StatCard from '../../components/shared/StatCard'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Table, { Td } from '../../components/ui/Table'
import { api } from '../../utils/apiService'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
)

const URGENCY_TONE = { emergency: 'red', urgent: 'yellow', normal: 'green' }
const STATUS_TONE = { pending: 'yellow', approved: 'green', rejected: 'red', in_progress: 'blue', completed: 'green' }

const REG_STATUS_TONE = { approved: 'success', pending: 'warning', rejected: 'danger' }

const QUICK_ACTIONS = [
  { icon: CheckCircle, label: 'Approve Pending', bg: 'bg-red-50 dark:bg-red-950/50', color: 'text-red-600 dark:text-red-400', to: '/admin/donors' },
  { icon: Megaphone, label: 'New Announcement', bg: 'bg-blue-50 dark:bg-blue-950/50', color: 'text-blue-600 dark:text-blue-400', to: '/admin/announcements' },
  { icon: BarChart2, label: 'View Reports', bg: 'bg-green-50 dark:bg-green-950/50', color: 'text-green-600 dark:text-green-400', to: '/admin/reports' },
  { icon: Building2, label: 'Hospitals', bg: 'bg-purple-50 dark:bg-purple-950/50', color: 'text-purple-600 dark:text-purple-400', to: '/admin/hospitals' },
]

const initials = (name) =>
  (name || '??').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

const BLOOD_GROUP_COLORS = [
  '#dc2626', '#f87171', '#2563eb', '#60a5fa',
  '#7c3aed', '#a78bfa', '#16a34a', '#4ade80',
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [requests, setRequests] = useState([])
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats.php'),
      api.get('/admin/requests.php'),
      api.get('/admin/donors.php'),
    ])
      .then(([statsRes, reqRes, donorRes]) => {
        if (statsRes.success) setStats(statsRes.stats)
        if (reqRes.success) setRequests(reqRes.requests || [])
        if (donorRes.success) setDonors(donorRes.donors || [])
      })
      .catch((err) => console.error('Admin dashboard fetch error:', err))
      .finally(() => setLoading(false))
  }, [])

  // Blood group doughnut from stats
  const bloodGroupLabels = stats?.blood_groups ? Object.keys(stats.blood_groups) : []
  const bloodGroupValues = stats?.blood_groups ? Object.values(stats.blood_groups) : []

  const doughnutData = {
    labels: bloodGroupLabels,
    datasets: [
      {
        data: bloodGroupValues,
        backgroundColor: BLOOD_GROUP_COLORS,
        borderWidth: 0,
      },
    ],
  }
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 12 } } },
  }

  // Donations bar chart (use blood group data for now)
  const barData = {
    labels: bloodGroupLabels,
    datasets: [
      {
        label: 'Donors',
        data: bloodGroupValues,
        backgroundColor: '#dc2626',
        borderRadius: 6,
        maxBarThickness: 34,
      },
    ],
  }
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.15)' } },
      x: { grid: { display: false } },
    },
  }

  const requestColumns = [
    { key: 'code', label: 'Code' },
    { key: 'patient', label: 'Patient' },
    { key: 'group', label: 'Group' },
    { key: 'hospital', label: 'Hospital' },
    { key: 'urgency', label: 'Urgency' },
    { key: 'status', label: 'Status' },
  ]

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A'
    const diff = Date.now() - new Date(isoString)
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
    return `${Math.floor(mins / 1440)}d ago`
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading admin dashboard...</div>
  }

  return (
    <div>
      <PageHeader
        title="Admin Console"
        subtitle="Platform-wide overview of donors, requests, and hospitals."
        actions={
          <Button as={Link} to="/admin/reports" variant="secondary">
            <Download className="h-4 w-4" /> View Reports
          </Button>
        }
      />

      {/* Pending approvals alert */}
      {(stats?.pending_donors > 0 || stats?.pending_hospitals > 0) && (
        <div className="mb-6 flex items-center gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/40">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>{(stats?.pending_donors || 0) + (stats?.pending_hospitals || 0)} pending approvals</strong>
            {' '}— {stats?.pending_donors || 0} donor(s), {stats?.pending_hospitals || 0} hospital(s)
          </p>
          <div className="ml-auto flex gap-2">
            <Button as={Link} to="/admin/donors" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white border-none shrink-0">
              Review Donors
            </Button>
            <Button as={Link} to="/admin/hospitals" size="sm" variant="outline" className="shrink-0 border-amber-600 text-amber-700">
              Review Hospitals
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total donors" value={stats?.total_donors || 0} />
        <StatCard icon={Droplet} label="Donations this month" value={stats?.completed_this_month || 0} />
        <StatCard icon={Building2} label="Partner hospitals" value={stats?.total_hospitals || 0} />
        <StatCard icon={Activity} label="Open requests" value={stats?.emergency_requests || 0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] lg:col-span-2 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">
            Donors by Blood Group
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Approved donor distribution</p>
          <div className="mt-6 h-72">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">
            Blood Group Distribution
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Donor count by group</p>
          <div className="mt-6 h-72">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-left transition-colors hover:border-red-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-500/50"
          >
            <span className={`flex size-10 items-center justify-center rounded-md ${a.bg} ${a.color}`}>
              <a.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Blood Requests Table */}
      <div className="mt-6 rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Recent blood requests</h3>
          <Button as={Link} to="/admin/requests" size="sm" variant="secondary">View All</Button>
        </div>
        <Table
          columns={requestColumns}
          data={requests.slice(0, 8)}
          empty="No requests found."
          renderRow={(r) => (
            <>
              <Td className="font-mono text-sm text-gray-900 dark:text-slate-100">{r.request_code}</Td>
              <Td>{r.patient_name}</Td>
              <Td>
                <BloodGroupBadge group={r.blood_type} size="sm" />
              </Td>
              <Td>{r.hospital_name}</Td>
              <Td>
                <Badge tone={URGENCY_TONE[r.urgency] || 'gray'} dot className="capitalize">
                  {r.urgency}
                </Badge>
              </Td>
              <Td>
                <Badge tone={STATUS_TONE[r.status] || 'gray'} className="capitalize">
                  {r.status}
                </Badge>
              </Td>
            </>
          )}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Donor Registrations */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">Recent Registrations</h3>
            <Button as={Link} to="/admin/donors" size="sm" variant="secondary">View All</Button>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-slate-700">
            {donors.slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  {initials(d.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-slate-100">{d.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{formatTime(d.registered_at)}</p>
                </div>
                <BloodGroupBadge group={d.blood_group} size="sm" />
                <Badge variant={REG_STATUS_TONE[d.status] || 'neutral'} size="sm" className="capitalize">
                  {d.status}
                </Badge>
              </li>
            ))}
            {donors.length === 0 && (
              <li className="py-4 text-center text-sm text-gray-500">No donors found.</li>
            )}
          </ul>
        </div>

        {/* Recent Blood Requests mini list */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">Recent Blood Requests</h3>
            <Button as={Link} to="/admin/requests" size="sm" variant="secondary">View All</Button>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-slate-700">
            {requests.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <BloodGroupBadge group={r.blood_type} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-slate-100">{r.patient_name}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-slate-400">{r.hospital_name}</p>
                </div>
                <Badge tone={URGENCY_TONE[r.urgency] || 'gray'} size="sm" dot className="capitalize">
                  {r.urgency}
                </Badge>
                <span className="shrink-0 text-xs text-gray-400 dark:text-slate-500">{formatTime(r.created_at)}</span>
              </li>
            ))}
            {requests.length === 0 && (
              <li className="py-4 text-center text-sm text-gray-500">No requests found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
