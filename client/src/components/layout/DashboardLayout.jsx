import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import api from '../../utils/apiService'
import {
  Droplet,
  ChevronDown,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Info,
  LayoutDashboard,
  HeartPulse,
  HandHeart,
  History,
  Award,
  MessageSquare,
  Bell,
  User,
  Users,
  Building2,
  BarChart3,
  Megaphone,
  ClipboardList,
  CalendarClock,
  Search,
  Menu,
  X,
  LogOut,
  Droplets,
} from 'lucide-react'
import ThemeToggle from '../shared/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

const NOTIF_ICONS = {
  emergency: { icon: AlertTriangle, cls: 'text-red-600 dark:text-red-400' },
  success: { icon: CheckCircle2, cls: 'text-green-600 dark:text-green-400' },
  info: { icon: Info, cls: 'text-blue-600 dark:text-blue-400' },
}

const NAV = {
  donor: [
    { to: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/donor/health', label: 'Health', icon: HeartPulse },
    { to: '/donor/voluntary', label: 'Voluntary Camps', icon: HandHeart },
    { to: '/donor/history', label: 'Donation History', icon: History },
    { to: '/donor/certificates', label: 'Certificates', icon: Award },
    { to: '/donor/chat', label: 'Messages', icon: MessageSquare },
    { to: '/donor/notifications', label: 'Notifications', icon: Bell },
    { to: '/donor/profile', label: 'Profile', icon: User },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/donors', label: 'Donors', icon: Users },
    { to: '/admin/hospitals', label: 'Hospitals', icon: Building2 },
    { to: '/admin/voluntary', label: 'Voluntary Camps', icon: HandHeart },
    { to: '/admin/blood-groups', label: 'Blood Inventory', icon: Droplets },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/admin/chat', label: 'Messages', icon: MessageSquare },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    { to: '/admin/profile', label: 'Profile', icon: User },
  ],
  hospital: [
    { to: '/hospital/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hospital/donors', label: 'Donor Network', icon: Users },
    { to: '/hospital/appointments', label: 'Appointments', icon: CalendarClock },
    { to: '/hospital/requests', label: 'Blood Requests', icon: ClipboardList },
    { to: '/hospital/chat', label: 'Messages', icon: MessageSquare },
    { to: '/hospital/notifications', label: 'Notifications', icon: Bell },
    { to: '/hospital/profile', label: 'Profile', icon: User },
  ],
  seeker: [
    { to: '/seeker/request', label: 'New Request', icon: Droplet },
    { to: '/seeker/tracking', label: 'Tracking', icon: Search },
    { to: '/seeker/chat', label: 'Messages', icon: MessageSquare },
    { to: '/seeker/notifications', label: 'Notifications', icon: Bell },
    { to: '/seeker/profile', label: 'Profile', icon: User },
  ],
}

const ROLE_LABELS = {
  donor: 'Donor Portal',
  admin: 'Admin Console',
  hospital: 'Hospital Portal',
  seeker: 'Seeker Portal',
}

export default function DashboardLayout({ role = 'donor' }) {
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = NAV[role] || NAV.donor
  const [notifications, setNotifications] = useState([])
  const unread = notifications.filter((n) => parseInt(n.is_read) === 0).length

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await api.get('/notifications/list.php?limit=5')
        if (data.notifications) {
          setNotifications(data.notifications)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read.php', {})
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })))
    } catch (err) {
      console.error(err)
    }
  }

  const closeMenus = () => {
    setNotifOpen(false)
    setProfileOpen(false)
  }

  const initials = (user?.name || 'BC')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const Sidebar = (
    <div className="flex h-full flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)]">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-sidebar-border)] px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white">
            <Droplet className="h-4.5 w-4.5" fill="currentColor" />
          </span>
          <span className="font-bold tracking-tight text-gray-900 dark:text-slate-100">
            Blood<span className="text-red-600">Connect</span>
          </span>
        </Link>
      </div>
      <div className="px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          {ROLE_LABELS[role]}
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)]'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[var(--color-sidebar-border)] p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-secondary)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-64">{Sidebar}</div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="sidebar-transition absolute inset-y-0 left-0 w-64">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 lg:hidden dark:border-slate-700 dark:text-slate-300"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search donors, requests…"
                className="h-9 w-56 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(false)
                  setNotifOpen((o) => !o)
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Notifications
                    </h4>
                    <button onClick={handleMarkAllRead} className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400">
                      Mark all read
                    </button>
                  </div>
                  <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-slate-700">
                    {notifications.length === 0 ? (
                      <li className="px-4 py-6 text-center text-sm text-gray-500 dark:text-slate-400">
                        No notifications
                      </li>
                    ) : (
                      notifications.slice(0, 5).map((n) => {
                        const meta = NOTIF_ICONS[n.type] || NOTIF_ICONS.info
                        const isUnread = parseInt(n.is_read) === 0
                        return (
                          <li
                            key={n.id}
                            className={`flex gap-3 px-4 py-3 ${isUnread ? 'bg-red-50/40 dark:bg-red-950/20' : ''}`}
                          >
                            <meta.icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${meta.cls}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                {n.title}
                              </p>
                              <p className="truncate text-xs text-gray-500 dark:text-slate-400">
                                {n.message}
                              </p>
                              <p className="mt-0.5 text-[11px] text-gray-400 dark:text-slate-500">
                                {new Date(n.created_at).toLocaleString()}
                              </p>
                            </div>
                          </li>
                        )
                      })
                    )}
                  </ul>
                  <Link
                    to={`/${role}/notifications`}
                    onClick={closeMenus}
                    className="block border-t border-gray-100 px-4 py-2.5 text-center text-sm font-medium text-red-600 hover:bg-gray-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-slate-700/50"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(false)
                  setProfileOpen((o) => !o)
                }}
                className="flex items-center gap-2 rounded-md border border-gray-200 py-1 pl-1 pr-2 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-700"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                  {initials}
                </span>
                <span className="hidden text-sm font-medium text-gray-700 dark:text-slate-200 sm:block">
                  {user?.name}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <Link
                    to={`/${role}/profile`}
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <User className="h-4 w-4" /> View profile
                  </Link>
                  <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-slate-700" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {(notifOpen || profileOpen) && (
            <div className="fixed inset-0 z-40" onClick={closeMenus} />
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
