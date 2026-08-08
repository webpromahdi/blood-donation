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
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import StatCard from '../../components/shared/StatCard'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/apiService'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

export default function DonorDashboard() {
  const { user } = useAuth()
  
  const [stats, setStats] = useState(null)
  const [activeDonation, setActiveDonation] = useState(null)
  const [history, setHistory] = useState([])
  const [camps, setCamps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/donor/profile.php'),
      api.get('/donor/history.php'),
      api.get('/donor/voluntary/list.php')
    ])
      .then(([profileRes, historyRes, campsRes]) => {
        if (profileRes.success) {
          setStats(profileRes.stats)
          setActiveDonation(profileRes.active_donation)
        }
        if (historyRes.success) {
          setHistory(historyRes.donations || [])
        }
        if (campsRes.success) {
          setCamps(campsRes.donations || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // Dummy chart data for now, since API doesn't provide yearly breakdown yet
  const chartData = {
    labels: ['2022', '2023', '2024', '2025', '2026'],
    datasets: [
      {
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
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#dc2626',
        pointRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.15)' }, ticks: { precision: 0 } },
      x: { grid: { display: false } },
    },
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's your donation impact at a glance."
        actions={
          <Button as={Link} to="/donor/voluntary">
            <CalendarClock className="h-4 w-4" /> Book a donation
          </Button>
        }
      />

      {/* Emergency / Active Donation banner */}
      {activeDonation && (
        <div className="mb-6 flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/60 dark:bg-amber-950/40">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                You have an active blood request: {activeDonation.request_code}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300/80">
                {activeDonation.hospital_name} needs {activeDonation.quantity} unit(s) for {activeDonation.patient_name}.
              </p>
            </div>
          </div>
          <Button size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-none">
            View Details
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Droplet} label="Total donations" value={stats?.total_donations || 0} />
        <StatCard icon={Award} label="Lives impacted" value={stats?.lives_saved || 0} />
        <StatCard icon={HeartPulse} label="Hemoglobin (g/dL)" value={user?.weight ? "14.2" : "N/A"} />
        <StatCard icon={CalendarClock} label="Days until eligible" value={stats?.days_until_eligible || 0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] lg:col-span-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                Donations over time
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Your yearly contribution
              </p>
            </div>
            <BloodGroupBadge group={user?.blood_group || 'N/A'} />
          </div>
          <div className="mt-6 h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Eligibility card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">
            Eligibility status
          </h3>
          <div className="mt-5 flex flex-col items-center text-center">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 ${stats?.is_eligible ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-amber-500 text-amber-600 dark:text-amber-400'}`}>
              <span className="text-2xl font-bold">{stats?.is_eligible ? 'Ready' : 'Wait'}</span>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-slate-300">
              {stats?.is_eligible ? 'You are eligible to donate today.' : `You can donate in ${stats?.days_until_eligible} days.`}
            </p>
            <div className="mt-4 w-full space-y-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Last donation</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">
                  {stats?.last_donation ? new Date(stats.last_donation).toLocaleDateString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Weight</span>
                <span className="font-medium text-gray-900 dark:text-slate-200">{user?.weight || 'N/A'} kg</span>
              </div>
            </div>
            <Button as={Link} to="/donor/health" variant="outline" size="sm" fullWidth className="mt-5">
              View health details
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent donations */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">
              Recent donations
            </h3>
            <Link to="/donor/history" className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-gray-100 dark:divide-slate-700">
            {history.length > 0 ? history.slice(0, 4).map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300">
                    <Droplet className="h-4 w-4" fill="currentColor" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {d.donation_type === 'voluntary' ? 'Voluntary Camp' : 'Direct Request'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {d.hospital || d.camp_name || 'General'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(d.completed_at || d.created_at).toLocaleDateString()}</p>
                  <Badge tone="green" dot>{d.status}</Badge>
                </div>
              </li>
            )) : (
              <li className="py-4 text-center text-sm text-gray-500">No recent donations.</li>
            )}
          </ul>
        </div>

        {/* Upcoming camps */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">
              Upcoming camps
            </h3>
            <Link to="/donor/voluntary" className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {camps.length > 0 ? camps.slice(0, 3).map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-md border border-gray-100 p-3 dark:border-slate-700"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {c.hospital_name || 'General Camp'}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3" /> {c.city || 'N/A'} · {new Date(c.scheduled_date || c.availability_date).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" variant="secondary" as={Link} to="/donor/voluntary">
                  View
                </Button>
              </li>
            )) : (
              <li className="py-4 text-center text-sm text-gray-500">No upcoming appointments.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
