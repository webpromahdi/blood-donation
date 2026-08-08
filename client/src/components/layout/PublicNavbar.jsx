import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Droplet, Menu, X } from 'lucide-react'
import ThemeToggle from '../shared/ThemeToggle'
import Button from '../ui/Button'

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
          <Button as={Link} to="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button as={Link} to="/register" size="sm">
            Become a donor
          </Button>
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
            <div className="mt-2 flex gap-2">
              <Button as={Link} to="/login" variant="secondary" size="sm" fullWidth>
                Log in
              </Button>
              <Button as={Link} to="/register" size="sm" fullWidth>
                Become a donor
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
