import { useState, useEffect } from 'react'
import {
  Bell,
  Droplet,
  AlertTriangle,
  CheckCircle,
  Info,
  Award,
  Calendar,
  Heart,
  AlertOctagon,
  XCircle
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import { api } from '../../utils/apiService'
import { useNavigate } from 'react-router-dom'
import { getNotificationRoute } from '../../utils/notificationUtils'

// Map the string icon from API to actual Lucide component
const ICON_MAP = {
  'info': Info,
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  'x-circle': XCircle,
  'droplet': Droplet,
  'heart': Heart,
  'award': Award,
  'calendar': Calendar,
  'bell': Bell,
  'alert-octagon': AlertOctagon,
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'request', label: 'Blood Requests' },
  { id: 'system', label: 'System' },
]

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications/list.php?limit=50')
      if (data.success) {
        setItems(data.notifications || [])
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      const data = await api.post('/notifications/mark-all-read.php', {})
      if (data.success) {
        // API returns `read` boolean field
        setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await api.post('/notifications/mark-read.php', { notification_id: n.id })
        setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))
      } catch (err) {
        console.error('Failed to mark as read:', err)
      }
    }
    const route = getNotificationRoute(n, 'hospital')
    navigate(route)
  }

  const filtered = items.filter((n) => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'request') return n.type === 'request'
    if (activeTab === 'system') return n.type !== 'request' && n.type !== 'donation'
    return true
  })

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on requests and account activity."
        actions={
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />

      <div className="mb-4 flex gap-6 border-b border-gray-200 dark:border-slate-700">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="rounded-md border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Loading notifications...
          </p>
        ) : filtered.length === 0 ? (
          <p className="rounded-md border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            No notifications to show.
          </p>
        ) : (
          filtered.map((n) => {
            // API returns flat: n.icon, n.iconBg, n.iconColor, n.read, n.time
            const Icon = ICON_MAP[n.icon] || Bell
            const unread = !n.read
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex cursor-pointer items-start gap-4 rounded-md border border-gray-200 p-4 hover:bg-gray-50 dark:border-slate-700 ${
                  unread
                    ? 'border-l-2 border-l-red-600 bg-red-50/40 dark:bg-red-950/10'
                    : 'bg-white dark:bg-slate-800'
                }`}
              >
                <div
                  className={`flex size-10 flex-shrink-0 items-center justify-center rounded-full ${n.iconBg || 'bg-gray-100'} ${n.iconColor || 'text-gray-600'}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-slate-400">
                    {n.message}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  {/* API already formats time string */}
                  <span className="text-xs text-gray-400">{n.time}</span>
                  {unread && <span className="size-2 rounded-full bg-red-600" />}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
