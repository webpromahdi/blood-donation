import { Link } from 'react-router-dom'
import { Droplet, Phone, Mail } from 'lucide-react'

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

const FacebookIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="-403.25 273 256 256" xmlns="http://www.w3.org/2000/svg">
    <path d="M-260.9,327.8c0-10.3,9.2-14,19.5-14c10.3,0,21.3,3.2,21.3,3.2l6.6-39.2c0,0-14-4.8-47.4-4.8c-20.5,0-32.4,7.8-41.1,19.3 c-8.2,10.9-8.5,28.4-8.5,39.7v25.7H-337V396h26.5v133h49.6V396h39.3l2.9-38.3h-42.2V327.8z" />
  </svg>
)

const InstagramIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M10.3332 3.64404c-0.1381 0 -0.25 -0.11193 -0.25 -0.25s0.1119 -0.25 0.25 -0.25" strokeWidth="1.2" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M10.3332 3.64404c0.1381 0 0.25 -0.11193 0.25 -0.25s-0.1119 -0.25 -0.25 -0.25" strokeWidth="1.2" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M0.858276 3.43141c0 -1.42103 1.151974 -2.573012 2.573014 -2.573012h6.86141c1.421 0 2.573 1.151982 2.573 2.573012v6.86139c0 1.421 -1.152 2.573 -2.573 2.573H3.43129c-1.42104 0 -2.573014 -1.152 -2.573014 -2.573V3.43141Z" strokeWidth="1.2" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M4.312 6.862a2.55 2.55 0 1 0 5.1 0 2.55 2.55 0 1 0 -5.1 0" strokeWidth="1.2" />
  </svg>
)

const TwitterIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z" />
  </svg>
)

const YoutubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M9.49614 7.13176C9.18664 6.9549 8.80639 6.95617 8.49807 7.13509C8.18976 7.31401 8 7.64353 8 8V16C8 16.3565 8.18976 16.686 8.49807 16.8649C8.80639 17.0438 9.18664 17.0451 9.49614 16.8682L16.4961 12.8682C16.8077 12.6902 17 12.3589 17 12C17 11.6411 16.8077 11.3098 16.4961 11.1318L9.49614 7.13176ZM13.9844 12L10 14.2768V9.72318L13.9844 12Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M0 12C0 8.25027 0 6.3754 0.954915 5.06107C1.26331 4.6366 1.6366 4.26331 2.06107 3.95491C3.3754 3 5.25027 3 9 3H15C18.7497 3 20.6246 3 21.9389 3.95491C22.3634 4.26331 22.7367 4.6366 23.0451 5.06107C24 6.3754 24 8.25027 24 12C24 15.7497 24 17.6246 23.0451 18.9389C22.7367 19.3634 22.3634 19.7367 21.9389 20.0451C20.6246 21 18.7497 21 15 21H9C5.25027 21 3.3754 21 2.06107 20.0451C1.6366 19.7367 1.26331 19.3634 0.954915 18.9389C0 17.6246 0 15.7497 0 12ZM9 5H15C16.9194 5 18.1983 5.00275 19.1673 5.10773C20.0989 5.20866 20.504 5.38448 20.7634 5.57295C21.018 5.75799 21.242 5.98196 21.4271 6.23664C21.6155 6.49605 21.7913 6.90113 21.8923 7.83269C21.9973 8.80167 22 10.0806 22 12C22 13.9194 21.9973 15.1983 21.8923 16.1673C21.7913 17.0989 21.6155 17.504 21.4271 17.7634C21.242 18.018 21.018 18.242 20.7634 18.4271C20.504 18.6155 20.0989 18.7913 19.1673 18.8923C18.1983 18.9973 16.9194 19 15 19H9C7.08058 19 5.80167 18.9973 4.83269 18.8923C3.90113 18.7913 3.49605 18.6155 3.23664 18.4271C2.98196 18.242 2.75799 18.018 2.57295 17.7634C2.38448 17.504 2.20866 17.0989 2.10773 16.1673C2.00275 15.1983 2 13.9194 2 12C2 10.0806 2.00275 8.80167 2.10773 7.83269C2.20866 6.90113 2.38448 6.49605 2.57295 6.23664C2.75799 5.98196 2.98196 5.75799 3.23664 5.57295C3.49605 5.38448 3.90113 5.20866 4.83269 5.10773C5.80167 5.00275 7.08058 5 9 5Z" />
  </svg>
)

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
            {[
              { Icon: FacebookIcon, label: 'Facebook' },
              { Icon: TwitterIcon, label: 'Twitter' },
              { Icon: InstagramIcon, label: 'Instagram' },
              { Icon: YoutubeIcon, label: 'Youtube' }
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-all hover:-translate-y-1 hover:bg-red-50 hover:text-red-600 hover:shadow-md dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                aria-label={`Visit our ${label} page`}
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
