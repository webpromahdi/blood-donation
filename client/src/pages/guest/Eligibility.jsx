import { Link } from 'react-router-dom'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  ArrowRight,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'

const BASIC_REQUIREMENTS = [
  'You are between 18 and 60 years of age.',
  'You weigh at least 50 kg (110 lbs).',
  'Your hemoglobin level is 12.5 g/dL or higher.',
  'You have had no serious illness or surgery recently.',
  'It has been at least 3 months since your last donation.',
  'You are feeling healthy and well on the day of donation.',
]

const TEMPORARY = [
  'A tattoo or body piercing within the last 6 months.',
  'Pregnancy, or having given birth in the last 6 months.',
  'Currently taking antibiotics or recovering from an infection.',
  'A cold, flu, or fever within the last week.',
]

const PERMANENT = [
  'HIV positive status or a history of hepatitis B or C.',
  'Serious heart disease or an existing cardiac condition.',
  'A history of certain cancers or blood-related disorders.',
]

const COMPATIBILITY = [
  { group: 'O-', to: 'Everyone (universal donor)' },
  { group: 'O+', to: 'O+, A+, B+, AB+' },
  { group: 'A-', to: 'A-, A+, AB-, AB+' },
  { group: 'A+', to: 'A+, AB+' },
  { group: 'B-', to: 'B-, B+, AB-, AB+' },
  { group: 'B+', to: 'B+, AB+' },
  { group: 'AB-', to: 'AB-, AB+' },
  { group: 'AB+', to: 'AB+ only' },
]

export default function Eligibility() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Am I Eligible to Donate?
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 dark:text-slate-400">
          Every safe donation starts with a healthy donor. Review the guidelines
          below to see if you are ready to give the gift of life.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* LEFT */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Basic Requirements
          </h3>
          <ul className="mt-4 space-y-3">
            {BASIC_REQUIREMENTS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-xl font-semibold text-gray-900 dark:text-white">
            Temporary Disqualifications
          </h3>
          <ul className="mt-4 space-y-3">
            {TEMPORARY.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-xl font-semibold text-gray-900 dark:text-white">
            Permanent Disqualifications
          </h3>
          <ul className="mt-4 space-y-3">
            {PERMANENT.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT */}
        <div>
          <div className="rounded-md border border-gray-200 p-6 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Blood Types &amp; Compatibility
            </h3>
            <div className="mt-4 space-y-3">
              {COMPATIBILITY.map((row) => (
                <div
                  key={row.group}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800"
                >
                  <BloodGroupBadge group={row.group} size="md" />
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    can donate to:{' '}
                    <span className="font-medium text-gray-900 dark:text-slate-200">
                      {row.to}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <span className="font-semibold">Why it matters:</span> Matching
                blood types correctly is critical. A single mismatched
                transfusion can be fatal, which is why O- donors are so valuable
                in emergencies and AB+ patients can receive from anyone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-md border border-gray-200 bg-gray-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ready to donate?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600 dark:text-slate-400">
          If you meet the requirements above, join thousands of donors across
          Bangladesh saving lives every day.
        </p>
        <div className="mt-6 flex justify-center">
          <Button as={Link} to="/register" variant="primary" size="lg">
            Register Today
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
