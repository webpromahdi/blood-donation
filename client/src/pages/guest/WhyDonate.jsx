import { Link } from 'react-router-dom'
import {
  Activity,
  Heart,
  Zap,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import Button from '../../components/ui/Button'

const BENEFITS = [
  {
    icon: Activity,
    title: 'Free Health Checkup',
    desc: 'Every donation includes a mini screening of your blood pressure, pulse, hemoglobin, and temperature.',
  },
  {
    icon: Heart,
    title: 'Reduces Heart Risk',
    desc: 'Regular donation helps regulate iron levels, which is linked to a lower risk of heart disease.',
  },
  {
    icon: Zap,
    title: 'Boosts Cell Production',
    desc: 'Your body replenishes the donated blood, stimulating the production of fresh red blood cells.',
  },
  {
    icon: TrendingUp,
    title: 'Burns Calories',
    desc: 'A single donation can burn around 650 calories as your body works to replace the lost blood.',
  },
]

const FACTS = [
  {
    tint: 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-200',
    text: 'One donation can save up to three lives.',
  },
  {
    tint: 'bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200',
    text: 'Blood makes up about 7% of your body weight.',
  },
  {
    tint: 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-200',
    text: 'O- is the universal donor blood type.',
  },
  {
    tint: 'bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-200',
    text: 'Red blood cells can be stored for up to 42 days.',
  },
  {
    tint: 'bg-orange-50 text-orange-800 dark:bg-orange-950/30 dark:text-orange-200',
    text: 'The average adult has about 5 litres of blood.',
  },
  {
    tint: 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
    text: 'A donation takes only 8 to 10 minutes.',
  },
  {
    tint: 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-200',
    text: 'Platelets must be used within just 5 days.',
  },
  {
    tint: 'bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200',
    text: 'You can donate whole blood every 3 months.',
  },
]

export default function WhyDonate() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* 1. Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Why Your Blood Donation Matters
        </h1>
        <p className="mt-4 text-base text-gray-600 dark:text-slate-400">
          Blood cannot be manufactured — it can only come from generous
          volunteers. Across Bangladesh, patients facing surgery, accidents,
          childbirth complications, and thalassemia depend on donors like you.
          Your single act of kindness can be the difference between life and
          loss for a stranger in need.
        </p>
      </section>

      {/* 2. Critical Need */}
      <section className="mt-14 rounded-md bg-red-50 p-8 dark:bg-red-950/30">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          The Critical Need
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              Every 2 seconds
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">
              someone somewhere needs blood.
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              8,000+ units
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">
              are needed every single day in Bangladesh.
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              Only 30%
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">
              of the country&apos;s demand is currently met.
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-700 dark:text-slate-300">
          The shortfall means families are often left searching desperately for
          donors during emergencies. Voluntary, regular donation is the only
          sustainable way to close this gap and ensure blood is ready the moment
          it is needed.
        </p>
      </section>

      {/* 3. Benefits */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          Benefits for You
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => {
            const Icon = b.icon
            return (
              <div
                key={b.title}
                className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                  {b.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Blood Facts */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          Blood Facts
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FACTS.map((f, i) => (
            <div
              key={i}
              className={`rounded-md p-5 text-sm font-medium ${f.tint}`}
            >
              {f.text}
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA */}
      <section className="mt-16 rounded-md border border-gray-200 bg-gray-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Become a Donor Today
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600 dark:text-slate-400">
          Join the BloodConnect community and be someone&apos;s reason to
          survive. It only takes a few minutes to register.
        </p>
        <div className="mt-6 flex justify-center">
          <Button as={Link} to="/register" variant="primary" size="lg">
            Become a Donor
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}
