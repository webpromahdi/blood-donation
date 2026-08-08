import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Heart,
  Building2,
  Award,
  Clock,
  UserPlus,
  Search,
  Star,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Droplet,
  ArrowRight,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS } from '../../utils/constants'
import { api } from '../../utils/apiService'

const WHY = [
  { icon: Heart, bg: 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400', title: 'Save Lives', body: 'One donation can save up to 3 patients in need.' },
  { icon: Users, bg: 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400', title: 'Help Community', body: 'Support patients in Dhaka, Chittagong, and beyond.' },
  { icon: Award, bg: 'bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400', title: 'Health Benefits', body: 'Regular donation reduces iron overload and lowers cancer risk.' },
  { icon: Clock, bg: 'bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400', title: 'Quick Process', body: 'The entire donation takes just 30–45 minutes of your time.' },
]

const STEPS = [
  { icon: UserPlus, title: 'Register as Donor', body: 'Create your profile with blood group and health details.' },
  { icon: Search, title: 'Get Matched', body: 'Our system matches you with urgent blood requests nearby.' },
  { icon: Heart, title: 'Save a Life', body: 'Visit the hospital and make your life-saving donation.' },
]

const BAR_FILL = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
}

const TESTIMONIALS = [
  { quote: "Donating blood is the easiest thing I've ever done to save a life. The BloodConnect team made every step effortless.", name: 'Karim Hossain', role: 'Regular Donor, Dhaka' },
  { quote: 'I needed O- blood urgently. BloodConnect found a donor in 2 hours when I had almost lost hope for my mother.', name: 'Fatema Begum', role: 'Blood Recipient, Chittagong' },
  { quote: 'As a hospital, BloodConnect has transformed how we manage blood supply and reach voluntary donors quickly.', name: 'Dr. Rahman', role: 'CMO, Dhaka Medical' },
]

const PARTNERS = [
  'Dhaka Medical College', 'BSMMU Hospital', 'Square Hospital',
  'Chittagong Medical', 'Rajshahi Medical', 'Sylhet MAG',
]

const REQUIREMENTS = [
  { ok: true, text: 'Age between 18–60 years' },
  { ok: true, text: 'Weight at least 50 kg' },
  { ok: true, text: 'Healthy with no chronic illness' },
  { ok: false, text: 'No donations in the last 3 months' },
]

const FAQS = [
  { q: 'Is blood donation safe?', a: 'Yes, only sterile single-use equipment is used for every donation, so there is no risk of infection.' },
  { q: 'How often can I donate?', a: 'You can donate whole blood every 3 months, and platelets every 2 weeks.' },
  { q: 'Does it hurt?', a: 'You will feel a brief pinch during needle insertion. Most donors feel no pain during the donation itself.' },
  { q: 'How long does it take?', a: 'Registration takes about 10 minutes and the donation 10–15 minutes — roughly 30 minutes in total.' },
  { q: 'Who can receive my blood?', a: 'It depends on compatibility between blood groups. O- is the universal donor and can be given to anyone.' },
]

function CountUp({ value, suffix = '', active }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / 1600, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(value * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, value])
  return (
    <span className="count-up">
      {n.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null)
  const [check, setCheck] = useState({ name: '', group: '' })
  const [checked, setChecked] = useState(false)
  const [impactActive, setImpactActive] = useState(false)
  const impactRef = useRef(null)

  const [stats, setStats] = useState({
    impact: { donors: 0, livesSaved: 0, hospitals: 0 },
    availability: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 }
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/guest/stats.php')
        if (res.success) {
          setStats({
            impact: res.impact,
            availability: Object.assign(
              { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 },
              res.availability
            )
          })
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const el = impactRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImpactActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-slate-800">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 55% at 85% 10%, rgba(220,38,38,0.12), transparent 70%)',
          }}
        />
        <div className="relative mx-auto flex min-h-[75vh] max-w-7xl flex-col items-center gap-12 px-6 py-14 lg:flex-row-reverse lg:gap-16">
          {/* Image side */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-video overflow-hidden rounded-md bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950/50 dark:to-slate-900">
              {/* CSS-only blood drop blob */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-40 w-40 rotate-45 bg-gradient-to-br from-red-500 to-red-700 shadow-xl"
                  style={{ borderRadius: '50% 50% 50% 0' }}
                />
              </div>
              {/* Floating stat pills */}
              <div className="absolute left-4 top-6 flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-md dark:bg-slate-800">
                <Users className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-gray-900 dark:text-slate-100">50K+</span>
                <span className="text-gray-500 dark:text-slate-400">Donors</span>
              </div>
              <div className="absolute bottom-6 left-8 flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-md dark:bg-slate-800">
                <Heart className="h-4 w-4 text-pink-500" fill="currentColor" />
                <span className="font-semibold text-gray-900 dark:text-slate-100">100K+</span>
                <span className="text-gray-500 dark:text-slate-400">Lives</span>
              </div>
              <div className="absolute bottom-16 right-4 flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-md dark:bg-slate-800">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-gray-900 dark:text-slate-100">200+</span>
                <span className="text-gray-500 dark:text-slate-400">Hospitals</span>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="w-full lg:w-1/2">
            <span className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-1.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              🩸 Every 2 Seconds Someone Needs Blood
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              Donate Blood,
              <br />
              <span className="text-red-600">Save Lives</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-gray-600 dark:text-slate-300">
              Join 50,000+ donors across Bangladesh. Your single donation can save up
              to 3 lives. Register today and make a difference.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button as={Link} to="/register" size="lg">
                <Droplet className="h-4 w-4" fill="currentColor" /> Become a Donor
              </Button>
              <Button as={Link} to="/seeker/request" variant="outline" size="lg">
                Request Blood
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-10 border-t border-gray-100 pt-8 dark:border-slate-800">
              {[
                { n: `${stats.impact.donors}+`, l: 'Registered donors' },
                { n: `${stats.impact.livesSaved}+`, l: 'Lives saved' },
                { n: '24/7', l: 'Emergency support' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-2xl font-bold text-red-600">{s.n}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHY DONATE */}
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
              Why Donate Blood?
            </h2>
            <p className="mt-3 text-gray-600 dark:text-slate-400">
              Every donation is a lifeline. Here's how your generosity creates real
              impact across Bangladesh.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((c) => (
              <div
                key={c.title}
                className="flex h-full flex-col rounded-md border border-gray-200 p-6 transition-all hover:border-red-200 hover:shadow-md dark:border-slate-700 dark:hover:border-red-900/60"
              >
                <span className={`flex size-10 items-center justify-center rounded-md ${c.bg}`}>
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-slate-100">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section className="bg-gray-50 py-20 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
              How It Works
            </h2>
            <p className="mt-3 text-gray-600 dark:text-slate-400">
              From sign-up to saving a life in three simple steps.
            </p>
          </div>
          <div className="relative mt-14 flex flex-col gap-10 lg:flex-row lg:gap-0">
            {/* dashed connector (desktop) */}
            <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-red-200 lg:block dark:border-red-900/50" />
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative flex items-start gap-4 text-left lg:w-1/3 lg:flex-col lg:items-center lg:text-center"
              >
                <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white">
                  {i + 1}
                </div>
                <div className="lg:mt-4 lg:flex lg:flex-col lg:items-center">
                  <step.icon className="hidden h-8 w-8 text-red-600 lg:block" />
                  <h3 className="text-lg font-semibold text-gray-900 lg:mt-3 dark:text-slate-100">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-gray-600 dark:text-slate-400">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — BLOOD AVAILABILITY */}
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
              Blood Group Availability
            </h2>
            <p className="mt-3 text-gray-600 dark:text-slate-400">
              Live donor counts by blood group across our national network.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {BLOOD_GROUPS.map((g) => {
              const donors = stats.availability[g] || 0
              const pct = Math.round((donors / Math.max(50, donors * 1.5)) * 100)
              const fill = BAR_FILL[BLOOD_GROUP_COLORS[g]] || 'bg-red-500'
              return (
                <div
                  key={g}
                  className="rounded-md border border-gray-200 p-5 text-center transition-shadow hover:shadow-md dark:border-slate-700"
                >
                  <div className="flex justify-center">
                    <BloodGroupBadge group={g} size="lg" />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {donors.toLocaleString('en-US')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">available</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-md bg-gray-200 dark:bg-slate-700">
                    <div className={`h-full rounded-md ${fill}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5 — IMPACT COUNTER */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={impactRef}
            className="rounded-md bg-gradient-to-r from-red-600 to-red-800 py-16 text-white shadow-xl"
          >
            <div className="grid grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
              {[
                { value: stats.impact.donors, suffix: '+', label: 'Donors Registered' },
                { value: stats.impact.livesSaved, suffix: '+', label: 'Lives Saved' },
                { value: stats.impact.hospitals, suffix: '+', label: 'Hospital Partners' },
                { value: 24, suffix: '/7', label: 'Emergency Support' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-4xl font-bold sm:text-5xl">
                    <CountUp value={s.value} suffix={s.suffix} active={impactActive} />
                  </p>
                  <p className="mt-2 text-lg text-red-100">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — TESTIMONIALS */}
      <section className="bg-gray-50 py-20 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
              What Donors Say
            </h2>
            <p className="mt-3 text-gray-600 dark:text-slate-400">
              Real stories from donors, recipients, and hospital partners.
            </p>
          </div>
          <div className="mt-12 flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="w-80 shrink-0 snap-start rounded-md border border-gray-200 bg-white p-6 md:w-auto dark:border-slate-700 dark:bg-slate-800"
              >
                <p className="-mt-2 font-serif text-6xl leading-none text-gray-200 dark:text-slate-600">
                  &ldquo;
                </p>
                <p className="-mt-4 italic text-gray-700 dark:text-slate-300">{t.quote}</p>
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-slate-700">
                  <span className="flex size-10 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                    {t.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">
                      {t.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — HOSPITAL PARTNERS */}
      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
              Trusted Hospital Partners
            </h2>
            <p className="mt-3 text-gray-600 dark:text-slate-400">
              200+ hospitals across Bangladesh trust our platform.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {PARTNERS.map((name) => (
              <div
                key={name}
                className="rounded-md border border-gray-200 p-4 text-center transition-colors hover:border-red-300 dark:border-slate-700 dark:hover:border-red-900/60"
              >
                <Building2 className="mx-auto h-7 w-7 text-gray-400 dark:text-slate-500" />
                <p className="mt-2 text-sm font-medium text-gray-600 dark:text-slate-300">
                  {name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — ELIGIBILITY QUICK CHECK */}
      <section className="bg-gray-50 py-20 dark:bg-slate-800/50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
              Are You Eligible?
            </h2>
            <p className="mt-3 text-gray-600 dark:text-slate-400">
              Most healthy adults can donate. Check the basics before you register.
            </p>
            <ul className="mt-6 space-y-3">
              {REQUIREMENTS.map((r) => (
                <li key={r.text} className="flex items-center gap-3">
                  {r.ok ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                  )}
                  <span className="text-gray-700 dark:text-slate-300">{r.text}</span>
                </li>
              ))}
            </ul>
            <Button as={Link} to="/eligibility" className="mt-7">
              Check Full Eligibility
            </Button>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Quick Check
            </h3>
            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                setChecked(true)
              }}
            >
              <Input
                label="Your name"
                placeholder="e.g. Rahim Khan"
                value={check.name}
                onChange={(e) => setCheck({ ...check, name: e.target.value })}
                required
              />
              <Select
                label="Blood group"
                placeholder="Select group"
                options={BLOOD_GROUPS}
                value={check.group}
                onChange={(e) => setCheck({ ...check, group: e.target.value })}
                required
              />
              <Button type="submit" fullWidth>
                Check Now
              </Button>
            </form>
            {checked && (
              <div className="fade-in mt-4 flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900/60 dark:bg-green-950/30">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  You appear eligible! Register to proceed and start saving lives.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 9 — FAQ ACCORDION */}
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-gray-600 dark:text-slate-400">
              Everything you need to know before donating.
            </p>
          </div>
          <div className="mt-10">
            {FAQS.map((f) => {
              const open = openFaq === f.q
              return (
                <div key={f.q}>
                  <button
                    onClick={() => setOpenFaq(open ? null : f.q)}
                    className="flex w-full items-center justify-between border-b border-gray-200 py-4 text-left dark:border-slate-700"
                  >
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48' : 'max-h-0'}`}
                  >
                    <p className="pb-4 pt-3 text-gray-600 dark:text-slate-400">{f.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-8 text-center">
            <Button as={Link} to="/faq" variant="outline">
              View All FAQs
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 10 — TRACK REQUEST */}
      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-8 shadow-sm sm:p-12 dark:border-blue-800 dark:bg-blue-950/30">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
              Track Your Blood Request
            </h2>
            <p className="mt-3 text-center text-gray-600 dark:text-slate-400">
              Follow your request status in real time.
            </p>
            <form
              className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                className="flex-1"
                icon={Search}
                placeholder="Request ID or Phone Number"
              />
              <Button type="submit">Track</Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-slate-500">
              Enter your request ID (e.g. BC2025-1234) or registered phone number.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 11 — NEWSLETTER / CTA */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-gray-900 py-16 text-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="mx-auto max-w-2xl px-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Join 50,000+ Blood Heroes Today
              </h2>
              <p className="mt-3 text-gray-300">
                Get updates on urgent blood needs in your area and save lives.
              </p>
              <form
                className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="h-10 flex-1 rounded-md border border-gray-700 bg-gray-800 px-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <Button type="submit">
                  Subscribe <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
              <p className="mt-3 text-xs text-gray-500">No spam. Only life-saving updates.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
