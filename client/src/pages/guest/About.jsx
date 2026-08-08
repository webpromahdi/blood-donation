import { Link } from 'react-router-dom'
import { Target, Eye, Users, Heart, Droplet, Globe, ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button'

const STATS = [
  { value: '12,000+', label: 'Patients Helped' },
  { value: '45,000', label: 'Registered Donors' },
  { value: '8', label: 'Divisions Covered' },
  { value: '98%', label: 'Match Rate' },
]

const TEAM = [
  {
    name: 'Tanvir Ahmed',
    initials: 'TA',
    role: 'Founder & CEO',
    bio: 'Started BloodConnect after a personal loss, driven to make matching donors instant and reliable.',
  },
  {
    name: 'Dr. Nasrin Sultana',
    initials: 'NS',
    role: 'Medical Director',
    bio: 'Hematologist ensuring every donation and screening step meets national safety standards.',
  },
  {
    name: 'Sabbir Hossain',
    initials: 'SH',
    role: 'Head of Operations',
    bio: 'Coordinates hospital partnerships and keeps emergency requests moving around the clock.',
  },
  {
    name: 'Farhana Islam',
    initials: 'FI',
    role: 'Community Lead',
    bio: 'Runs donor drives on campuses and mosques to grow a nationwide volunteer network.',
  },
]

const TIMELINE = [
  { year: '2019', text: 'BloodConnect founded in Dhaka with a handful of volunteer donors.' },
  { year: '2021', text: 'Expanded to Chattogram and Sylhet; crossed 5,000 registered donors.' },
  { year: '2022', text: 'Launched instant emergency request matching across all major hospitals.' },
  { year: '2024', text: 'Reached all 8 divisions of Bangladesh with verified local donors.' },
  { year: '2025', text: 'Surpassed 12,000 patients helped and 45,000 registered donors.' },
]

export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 sm:text-4xl">
          About BloodConnect
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-slate-300">
          Since 2019, BloodConnect has connected voluntary blood donors with patients in urgent
          need across Bangladesh, making safe blood reachable in every division.
        </p>
      </section>

      {/* Mission / Vision */}
      <section className="mt-14 grid gap-6 sm:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex size-12 items-center justify-center rounded-md bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-slate-100">Our Mission</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
            To ensure that no patient in Bangladesh dies waiting for blood, by building the fastest
            and most trusted network of voluntary donors nationwide.
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex size-12 items-center justify-center rounded-md bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
            <Eye className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-slate-100">Our Vision</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
            A Bangladesh where every hospital and family has instant access to safe, matched blood,
            powered by a culture of regular voluntary donation.
          </p>
        </div>
      </section>

      {/* Impact */}
      <section className="mt-14">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-slate-100">
          Our Impact
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-md border border-gray-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mt-14">
        <h2 className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-bold text-gray-900 dark:text-slate-100">
          <Users className="h-6 w-6 text-red-600" />
          Meet the Team
        </h2>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {TEAM.map((m) => (
            <div
              key={m.name}
              className="rounded-md border border-gray-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                {m.initials}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-slate-100">{m.name}</h3>
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{m.role}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                {m.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-14">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-slate-100">
          Our Journey
        </h2>
        <ol className="relative mx-auto max-w-2xl border-l border-gray-200 dark:border-slate-700">
          {TIMELINE.map((t) => (
            <li key={t.year} className="mb-8 ml-6 last:mb-0">
              <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-red-600" />
              <p className="font-bold text-gray-900 dark:text-slate-100">{t.year}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-md bg-slate-900 p-10 text-center dark:border dark:border-slate-700">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-md bg-red-600/20 text-red-400">
          <Heart className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Join Our Mission</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          Every donor makes a difference. Become part of the network that keeps Bangladesh supplied
          with safe blood.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/register" variant="primary" size="lg">
            <Droplet className="h-4 w-4" fill="currentColor" />
            Register Today
          </Button>
          <Button as={Link} to="/contact" variant="outline" size="lg">
            Contact Us
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-6 flex items-center justify-center gap-1 text-xs text-slate-400">
          <Globe className="h-3 w-3" />
          Serving all 8 divisions of Bangladesh
        </p>
      </section>
    </div>
  )
}
