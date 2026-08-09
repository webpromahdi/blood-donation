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

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await api.post('/notifications/mark-read.php', { notification_id: n.id })
        setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))
      } catch (err) {
        console.error('Failed to mark as read:', err)
      }
    }
    const route = getNotificationRoute(n, 'seeker')
    navigate(route)
  }

  const markAllAsRead = async () => {
    const unreadIds = items.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return

    setItems((prev) => prev.map((n) => ({ ...n, read: true })))

    try {
      await api.post('/notifications/mark-read.php', { id: 'all' })
    } catch (err) {
      console.error('Failed to mark all read:', err)
      // Revert if failed (simplified, assumes we just re-fetch)
      fetchNotifications()
    }
  }

  // Filter based on active tab
  const filtered = items.filter((n) => {
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'request') return n.type === 'request'
    if (activeTab === 'system') return n.type === 'system'
    return true
  })

  const unreadCount = items.filter((n) => !n.read).length

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Notifications"
          subtitle="Stay updated with your activities."
          className="mb-0"
        />
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-red-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
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
