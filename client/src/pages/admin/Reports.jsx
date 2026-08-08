import { useState, useEffect } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Download, Users, Droplet, Activity, CheckCircle, Bell } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import StatCard from '../../components/shared/StatCard'
import Button from '../../components/ui/Button'
import { api } from '../../utils/apiService'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

const AXIS = '#94a3b8'

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/reports.php?action=chart_data')
      if (res.success) {
        setData(res)
      }
    } catch (err) {
      console.error('Failed to fetch report data', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return <div className="p-8 text-center text-gray-500">Loading reports...</div>
  }

  const {
    monthly_trends = [],
    blood_type_distribution = [],
    total_donations = 0,
    total_requests = 0,
    completed_donations = 0,
    active_donors = 0,
    success_rate = 0,
    lives_saved = 0
  } = data

  const months = monthly_trends.map((t) => t.month_label)
  const monthlyDonations = monthly_trends.map((t) => t.donations)
  const monthlyRequests = monthly_trends.map((t) => t.requests)

  const dualBar = {
    labels: months,
    datasets: [
      { label: 'Donations', data: monthlyDonations, backgroundColor: '#dc2626', borderRadius: 4, maxBarThickness: 22 },
      { label: 'Requests', data: monthlyRequests, backgroundColor: '#2563eb', borderRadius: 4, maxBarThickness: 22 },
    ],
  }

  const doughnutData = {
    labels: blood_type_distribution.map(b => b.name),
    datasets: [
      {
        data: blood_type_distribution.map(b => b.value),
        backgroundColor: blood_type_distribution.map(b => b.color),
        borderWidth: 0,
      },
    ],
  }

  const lineData = {
    labels: months,
    datasets: [
      {
        label: 'Donation Trends',
        data: monthlyDonations,
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: AXIS } } },
    scales: {
      x: { ticks: { color: AXIS }, grid: { display: false } },
      y: { ticks: { color: AXIS }, grid: { color: 'rgba(148,163,184,0.1)' } },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: AXIS } } },
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: AXIS }, grid: { display: false } },
      y: { ticks: { color: AXIS }, grid: { color: 'rgba(148,163,184,0.1)' }, beginAtZero: true },
    },
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        subtitle="Insights on platform activity, donations, and requirements."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => window.open(`${api.baseURL}/admin/reports.php?action=download&report_type=monthly&format=csv`)}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Active Donors" value={active_donors} />
        <StatCard icon={Droplet} label="Total Donations" value={total_donations} />
        <StatCard icon={Activity} label="Total Requests" value={total_requests} />
        <StatCard icon={CheckCircle} label="Success Rate" value={`${success_rate}%`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Donations vs Requests */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] lg:col-span-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">Supply vs Demand</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Monthly comparison</p>
            </div>
          </div>
          <div className="h-72">
            <Bar data={dualBar} options={barOptions} />
          </div>
        </div>

        {/* Blood Group Distribution */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-6 font-semibold text-gray-900 dark:text-slate-100">Donor Demographics</h3>
          <div className="h-64">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Trend Line */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] lg:col-span-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">Donation Trend</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Monthly activity volume</p>
            </div>
          </div>
          <div className="h-72">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}
