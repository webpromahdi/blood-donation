import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Droplet, Menu, X, User, ChevronDown } from 'lucide-react'
import ThemeToggle from '../shared/ThemeToggle'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/donors', label: 'Find Donors' },
  { to: '/why-donate', label: 'Why Donate' },
  { to: '/eligibility', label: 'Eligibility' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function PublicNavbar() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-red-600 text-white">
            <Droplet className="h-5 w-5" fill="currentColor" />
          </span>
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-slate-100">
            Blood<span className="text-red-600">Connect</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 z-40 mt-2 w-48 origin-top-right rounded-md border border-gray-200 bg-white py-1 shadow-lg shadow-black/5 ring-1 ring-black/5 transition-all focus:outline-none dark:border-slate-700 dark:bg-slate-800">
                    {user.role === 'seeker' ? (
                      <Link
                        to="/seeker/request"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        onClick={() => setProfileOpen(false)}
                      >
                        New Request
                      </Link>
                    ) : (
                      <Link
                        to={`/${user.role}/dashboard`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        onClick={() => setProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      to={`/${user.role}/profile`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false)
                        logout()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button as={Link} to="/register" size="sm">
                Become a donor
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 dark:border-slate-700 dark:text-slate-300"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-900">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                      : 'text-gray-600 dark:text-slate-300'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-slate-800">
              {user ? (
                <>
                  <div className="mb-2 flex items-center gap-3 px-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{user.name}</p>
                      <p className="text-xs capitalize text-gray-500 dark:text-slate-400">{user.role}</p>
                    </div>
                  </div>
                  {user.role === 'seeker' ? (
                    <Link
                      to="/seeker/request"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      New Request
                    </Link>
                  ) : (
                    <Link
                      to={`/${user.role}/dashboard`}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to={`/${user.role}/profile`}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false)
                      logout()
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button as={Link} to="/login" variant="secondary" size="sm" fullWidth onClick={() => setOpen(false)}>
                    Log in
                  </Button>
                  <Button as={Link} to="/register" size="sm" fullWidth onClick={() => setOpen(false)}>
                    Become a donor
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
