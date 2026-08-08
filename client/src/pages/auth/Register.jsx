import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Droplet,
  Building2,
  CheckCircle,
  Upload,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import ThemeToggle from '../../components/shared/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import {
  BLOOD_GROUPS,
  BANGLADESH_DIVISIONS,
} from '../../utils/constants'
import { api } from '../../utils/apiService'

const STEP_LABELS = ['Role', 'Personal Info', 'Health Info', 'Credentials']

const ROLE_CARDS = [
  { key: 'donor', icon: Heart, color: 'text-red-500', title: 'Donor', body: 'I want to donate blood' },
  { key: 'seeker', icon: Droplet, color: 'text-blue-500', title: 'Seeker', body: 'I need blood for a patient' },
  { key: 'hospital', icon: Building2, color: 'text-green-500', title: 'Hospital', body: 'I represent a hospital' },
]

const GENDERS = ['Male', 'Female', 'Other']
const HOSPITAL_TYPES = ['Government', 'Private', 'NGO', 'Clinic']

function passwordStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH = [
  { label: '', color: '' },
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Fair', color: 'bg-orange-500' },
  { label: 'Good', color: 'bg-amber-500' },
  { label: 'Strong', color: 'bg-green-500' },
]

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [apiError, setApiError] = useState('')
  const [photo, setPhoto] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    division: '',
    district: '',
    address: '',
    bloodGroup: '',
    weight: '',
    lastDonation: '',
    conditions: '',
    hospitalName: '',
    license: '',
    hospitalType: '',
    beds: '',
    email: '',
    password: '',
    confirm: '',
    agree: false,
  })

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const strength = passwordStrength(form.password)

  const canContinue = () => {
    if (currentStep === 1) return !!selectedRole
    return true
  }

  const next = () => setCurrentStep((s) => Math.min(s + 1, 4))
  const back = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const onPhoto = (e) => {
    const file = e.target.files?.[0]
    if (file) setPhoto(URL.createObjectURL(file))
  }

  const submit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setApiError('')
    
    // Map form state to PHP expected fields
    const payload = {
      name: form.fullName || form.hospitalName,
      email: form.email,
      password: form.password,
      role: selectedRole === 'hospital' ? 'hospital' : selectedRole,
      phone: form.phone,
      blood_group: form.bloodGroup,
      division: form.division,
      district: form.district,
      address: form.address,
    }

    try {
      const data = await api.post('/auth/register.php', payload)
      if (data.success) {
        setDone(true)
      } else {
        setApiError(data.message || 'Registration failed.')
      }
    } catch (err) {
      setApiError(err?.message || 'Network error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const isHealthRole = selectedRole === 'donor' || selectedRole === 'seeker'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl rounded-md border border-gray-200 bg-white p-8 shadow-md dark:border-slate-700 dark:bg-slate-800">
        {done ? (
          <div className="flex flex-col items-center py-10 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-slate-100">
              Account Created!
            </h2>
            <p className="mt-2 max-w-sm text-gray-500 dark:text-slate-400">
              Welcome to BloodConnect. Your account is ready — you can now sign in and
              start saving lives.
            </p>
            <div className="mt-6 flex gap-3">
              <Button as={Link} to="/login" variant="outline">
                Login here
              </Button>
              <Button onClick={() => navigate('/donor/dashboard')}>Go to dashboard</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Link>
              <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-slate-100">
                <Heart className="h-5 w-5 text-red-600" fill="currentColor" /> BloodConnect
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-6 grid grid-cols-4 gap-2">
              {STEP_LABELS.map((label, i) => {
                const step = i + 1
                const completed = currentStep > step
                const current = currentStep === step
                return (
                  <div key={label} className="relative flex flex-col items-center">
                    {i < 3 && (
                      <span
                        className={`absolute left-1/2 top-4 -z-0 h-0.5 w-full ${completed ? 'bg-red-600' : 'bg-gray-200 dark:bg-slate-700'}`}
                      />
                    )}
                    <div
                      className={`relative z-10 flex size-9 items-center justify-center rounded-full text-sm font-semibold ${
                        completed
                          ? 'bg-green-500 text-white'
                          : current
                            ? 'bg-red-600 text-white'
                            : 'border-2 border-gray-300 text-gray-400 dark:border-slate-600 dark:text-slate-500'
                      }`}
                    >
                      {completed ? <CheckCircle className="h-5 w-5" /> : step}
                    </div>
                    <span
                      className={`mt-2 text-center text-xs ${current ? 'font-medium text-gray-900 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'}`}
                    >
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>

            {apiError && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                {apiError}
              </div>
            )}

            <form onSubmit={submit} className="mt-8">
              {/* STEP 1 — ROLE */}
              {currentStep === 1 && (
                <div className="fade-in">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      I want to...
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                      Choose the role that describes you best.
                    </p>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {ROLE_CARDS.map((r) => {
                      const active = selectedRole === r.key
                      return (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => setSelectedRole(r.key)}
                          className={`relative rounded-md border-2 p-6 text-center transition-all hover:border-red-300 ${
                            active
                              ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                              : 'border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          {active && (
                            <CheckCircle className="absolute right-2 top-2 h-5 w-5 text-green-500" />
                          )}
                          <r.icon className={`mx-auto h-12 w-12 ${r.color}`} />
                          <h3 className="mt-3 font-semibold text-gray-900 dark:text-slate-100">
                            {r.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                            {r.body}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2 — PERSONAL INFO */}
              {currentStep === 2 && (
                <div className="fade-in grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    className="sm:col-span-2"
                    label="Full Name"
                    placeholder="Rahim Khan"
                    value={form.fullName}
                    onChange={set('fullName')}
                  />
                  <Input label="Date of Birth" type="date" value={form.dob} onChange={set('dob')} />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Gender
                    </span>
                    <div className="flex gap-3">
                      {GENDERS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm({ ...form, gender: g })}
                          className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                            form.gender === g
                              ? 'border-red-600 bg-red-600 text-white'
                              : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+880 1XXXXXXXXX"
                    value={form.phone}
                    onChange={set('phone')}
                  />
                  <Select
                    label="Division"
                    placeholder="Select division"
                    options={BANGLADESH_DIVISIONS}
                    value={form.division}
                    onChange={set('division')}
                  />
                  <Input
                    label="District"
                    placeholder="e.g. Dhanmondi"
                    value={form.district}
                    onChange={set('district')}
                  />
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Address
                    </label>
                    <textarea
                      rows={3}
                      placeholder="House, road, area…"
                      value={form.address}
                      onChange={set('address')}
                      className="resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3 — HEALTH / ROLE INFO */}
              {currentStep === 3 && (
                <div className="fade-in flex flex-col gap-5">
                  {isHealthRole ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Blood Group
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {BLOOD_GROUPS.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setForm({ ...form, bloodGroup: g })}
                              className={`rounded-md border py-2 text-center text-sm font-bold transition-colors ${
                                form.bloodGroup === g
                                  ? 'border-red-600 bg-red-600 text-white'
                                  : 'border-gray-300 text-gray-700 hover:border-red-300 dark:border-slate-600 dark:text-slate-200'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                          label="Weight (kg)"
                          type="number"
                          placeholder="e.g. 65"
                          value={form.weight}
                          onChange={set('weight')}
                        />
                        <Input
                          label="Last Donation Date"
                          hint="Optional"
                          type="date"
                          value={form.lastDonation}
                          onChange={set('lastDonation')}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Medical Conditions
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g. diabetes, hypertension"
                          value={form.conditions}
                          onChange={set('conditions')}
                          className="resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        className="sm:col-span-2"
                        label="Hospital Name"
                        placeholder="e.g. Square Hospital Ltd."
                        value={form.hospitalName}
                        onChange={set('hospitalName')}
                      />
                      <Input
                        label="Registration / License No."
                        placeholder="e.g. DGHS-2024-01234"
                        value={form.license}
                        onChange={set('license')}
                      />
                      <Select
                        label="Hospital Type"
                        placeholder="Select type"
                        options={HOSPITAL_TYPES}
                        value={form.hospitalType}
                        onChange={set('hospitalType')}
                      />
                      <Input
                        label="Total Beds"
                        type="number"
                        placeholder="e.g. 250"
                        value={form.beds}
                        onChange={set('beds')}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4 — CREDENTIALS */}
              {currentStep === 4 && (
                <div className="fade-in flex flex-col gap-5">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set('email')}
                  />
                  <div>
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={set('password')}
                    />
                    <div className="mt-2 flex gap-1.5">
                      {[1, 2, 3, 4].map((seg) => (
                        <span
                          key={seg}
                          className={`h-1.5 flex-1 rounded-md transition-colors ${seg <= strength ? STRENGTH[strength].color : 'bg-gray-200 dark:bg-slate-700'}`}
                        />
                      ))}
                    </div>
                    {form.password && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        Strength: {STRENGTH[strength].label || 'Too short'}
                      </p>
                    )}
                  </div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={form.confirm}
                    onChange={set('confirm')}
                    error={
                      form.confirm && form.confirm !== form.password
                        ? 'Passwords do not match.'
                        : undefined
                    }
                  />

                  {/* Photo upload */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Profile Photo
                    </span>
                    <div className="flex items-center gap-4">
                      {photo && (
                        <img
                          src={photo}
                          alt="Profile preview"
                          className="size-20 shrink-0 rounded-full object-cover"
                        />
                      )}
                      <label className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 py-5 text-sm text-gray-500 transition-colors hover:border-red-300 hover:text-red-600 dark:border-slate-600 dark:text-slate-400">
                        <Upload className="h-5 w-5" />
                        Click to upload photo
                        <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
                      </label>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={set('agree')}
                      className="mt-0.5 h-4 w-4 rounded-md accent-red-600"
                    />
                    I agree to the Terms of Service and Privacy Policy.
                  </label>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <Button type="button" variant="outline" onClick={back}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                ) : (
                  <span />
                )}
                {currentStep < 4 ? (
                  <Button type="button" onClick={next} disabled={!canContinue()}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" loading={isLoading} disabled={!form.agree}>
                    Create Account
                  </Button>
                )}
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-red-600 dark:text-red-400">
                Login here
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
