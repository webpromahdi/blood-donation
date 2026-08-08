import { Link } from 'react-router-dom'
import { MapPin, Droplet } from 'lucide-react'
import BloodGroupBadge from './BloodGroupBadge'
import Button from '../ui/Button'

// Deterministic avatar tint from the first letter of the donor's name.
const AVATAR_TINTS = [
  { range: 'ABCD', cls: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' },
  { range: 'EFGH', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  { range: 'IJKL', cls: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300' },
  { range: 'MNOP', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  { range: 'QRST', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300' },
  { range: 'UVWXYZ', cls: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' },
]

function avatarTint(name = '') {
  const first = (name.trim()[0] || 'A').toUpperCase()
  return (AVATAR_TINTS.find((t) => t.range.includes(first)) || AVATAR_TINTS[0]).cls
}

export default function DonorCard({ donor }) {
  const initials = donor.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
  // Support both spec field names and the app's existing mock data shape.
  const district = donor.district ?? donor.area
  const available = donor.isAvailable ?? donor.available
  const lastDonated = donor.lastDonated ?? donor.lastDonation

  return (
    <div className="group flex h-full flex-col rounded-md border border-gray-200 bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:border-red-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-900/60">
      <div className="flex items-start justify-between">
        <div
          className={`flex size-14 items-center justify-center rounded-full text-lg font-semibold ${avatarTint(donor.name)}`}
        >
          {initials}
        </div>
        <BloodGroupBadge group={donor.bloodGroup} size="sm" />
      </div>

      <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-slate-100">
        {donor.name}
      </h3>
      <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
        <MapPin className="h-3.5 w-3.5" />
        {district}, {donor.division}
      </p>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
        <Droplet className="h-3.5 w-3.5 text-red-500" fill="currentColor" />
        {donor.totalDonations} donations
        <span
          className={`ml-auto inline-flex items-center gap-1 text-xs font-medium ${available ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${available ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          {available ? 'Available' : 'Resting'}
        </span>
      </div>
      {lastDonated && (
        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
          Last donated {lastDonated}
        </p>
      )}

      <div className="mt-auto pt-4">
        <Button as={Link} to={`/donors/${donor.id}`} variant="outline" size="sm" fullWidth>
          View profile
        </Button>
      </div>
    </div>
  )
}
