import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Droplet,
  Award,
  Trophy,
  Star,
  Lock,
  Heart,
  Calendar,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'

const DONOR = {
  name: 'Rahim Khan',
  initials: 'RK',
  group: 'A+',
  area: 'Dhanmondi',
  city: 'Dhaka',
  division: 'Dhaka',
  totalDonations: 12,
  livesSaved: 36,
  memberSince: 2021,
  age: 29,
  available: true,
}

const HISTORY = [
  { hospital: 'Dhaka Medical College Hospital', date: '12 Jan 2026' },
  { hospital: 'Square Hospital, Panthapath', date: '03 Sep 2025' },
  { hospital: 'United Hospital, Gulshan', date: '18 Apr 2025' },
  { hospital: 'Popular Diagnostic, Dhanmondi', date: '27 Nov 2024' },
  { hospital: 'Ibn Sina Hospital, Kallyanpur', date: '09 Feb 2021' },
]

const BADGES = [
  { name: 'First Drop', icon: Award, tone: 'text-red-600', earned: true },
  { name: '5 Lives', icon: Star, tone: 'text-amber-500', earned: true },
  { name: '10 Lives', icon: Trophy, tone: 'text-purple-600', earned: true },
  { name: 'Community Hero', icon: Heart, tone: 'text-gray-400', earned: false },
  { name: 'Platinum', icon: Award, tone: 'text-gray-400', earned: false },
  { name: 'Super Donor', icon: Trophy, tone: 'text-gray-400', earned: false },
]

const TABS = ['Overview', 'Donation History', 'Badges']

function StatCard({ label, value }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-800">
      <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 dark:border-slate-700">
      <span className="text-sm text-gray-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{value}</span>
    </div>
  )
}

export default function DonorProfile() {
  useParams()
  const [tab, setTab] = useState('Overview')

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link
        to="/donors"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Find Donors
      </Link>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-1">
          <div className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
              {DONOR.initials}
            </div>
            <div className="mt-4 flex justify-center">
              <BloodGroupBadge group={DONOR.group} size="lg" />
            </div>
            <h2 className="mt-4 text-center text-xl font-bold text-gray-900 dark:text-slate-100">
              {DONOR.name}
            </h2>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-slate-400">
              <MapPin className="h-4 w-4" />
              {DONOR.area}, {DONOR.city}
            </p>
            {DONOR.available && (
              <div className="mt-3 flex justify-center">
                <Badge variant="success" dot>
                  Available to Donate
                </Badge>
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2">
              <StatCard label="Total Donations" value={DONOR.totalDonations} />
              <StatCard label="Lives Saved" value={DONOR.livesSaved} />
              <StatCard label="Member Since" value={DONOR.memberSince} />
            </div>

            <Button variant="primary" fullWidth className="mt-6">
              <Heart className="h-4 w-4" />
              Request This Donor
            </Button>
            <div className="mt-3 text-center">
              <button
                type="button"
                className="text-xs text-gray-400 transition-colors hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
              >
                Report Profile
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="lg:col-span-2">
          <div className="mb-6 flex gap-6 border-b border-gray-200 dark:border-slate-700">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Overview' && (
            <div className="space-y-6">
              <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                <p>
                  Rahim is a regular voluntary blood donor based in Dhanmondi, Dhaka. Over the
                  past five years he has donated whenever his blood type was urgently needed,
                  responding to emergency requests across the capital at all hours.
                </p>
                <p>
                  He began donating after losing a close relative who could not find a matching
                  donor in time. That experience turned him into a committed advocate for
                  voluntary donation, and he now encourages friends and colleagues to register
                  with BloodConnect.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow label="Blood Group" value={DONOR.group} />
                <InfoRow label="Age" value={`${DONOR.age} years`} />
                <InfoRow label="Division" value={DONOR.division} />
                <InfoRow label="Total Donations" value={DONOR.totalDonations} />
                <InfoRow label="Languages" value="Bangla / English" />
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
                  <Droplet className="h-4 w-4 text-red-600" fill="currentColor" />
                  Donation Facts
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                  <li>Each donation of A+ blood can help save up to 3 lives.</li>
                  <li>He can safely donate again 90 days after his last donation.</li>
                  <li>His fastest response to an emergency request was under 40 minutes.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'Donation History' && (
            <ul className="space-y-4">
              {HISTORY.map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60">
                    <Droplet className="h-4 w-4 text-red-600 dark:text-red-300" fill="currentColor" />
                  </div>
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {item.hospital}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </p>
                    </div>
                    <Badge variant="success">Completed</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {tab === 'Badges' && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {BADGES.map((b) => {
                const Icon = b.icon
                return (
                  <div
                    key={b.name}
                    className={`rounded-md border border-gray-200 p-4 text-center dark:border-slate-700 ${
                      b.earned ? 'bg-white dark:bg-slate-800' : 'opacity-50 grayscale'
                    }`}
                  >
                    <div className="mb-2 flex justify-center">
                      {b.earned ? (
                        <Icon className={`h-8 w-8 ${b.tone}`} />
                      ) : (
                        <Lock className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {b.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                      {b.earned ? 'Earned' : 'Locked'}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
