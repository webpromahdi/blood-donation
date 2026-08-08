import { Link } from 'react-router-dom'
import { Droplet, Globe, MessageCircle, Share2, Mail, Phone } from 'lucide-react'

const COLS = [
  {
    title: 'Platform',
    links: [
      { to: '/donors', label: 'Find Donors' },
      { to: '/track-request', label: 'Track a Request' },
      { to: '/why-donate', label: 'Why Donate' },
      { to: '/eligibility', label: 'Eligibility' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { to: '/blog', label: 'Blog' },
      { to: '/faq', label: 'FAQ' },
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact' },
    ],
  },
]

export default function PublicFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-red-600 text-white">
              <Droplet className="h-5 w-5" fill="currentColor" />
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Blood<span className="text-red-600">Connect</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-gray-500 dark:text-slate-400">
            Connecting voluntary blood donors with patients across Bangladesh. Every drop
            counts — join a community of over 48,000 verified donors saving lives daily.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-red-500" /> +880 1711-000000 (24/7 Hotline)
            </span>
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-red-500" /> help@bloodconnect.com.bd
            </span>
          </div>
          <div className="mt-5 flex gap-2">
            {[Globe, MessageCircle, Share2].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:text-slate-400"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {col.title}
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 transition-colors hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 py-5 dark:border-slate-800">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-400 dark:text-slate-500 sm:px-6 lg:px-8">
          © 2026 BloodConnect Bangladesh. A non-profit initiative. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
