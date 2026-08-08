import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Heart,
  Shield,
  Building2,
  User,
  Key,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import ThemeToggle from '../../components/shared/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { DEMO_CREDENTIALS } from '../../utils/constants'

const ROLES = [
  { key: 'donor', label: 'Donor', icon: Heart },
  { key: 'admin', label: 'Admin', icon: Shield },
  { key: 'hospital', label: 'Hospital', icon: Building2 },
  { key: 'seeker', label: 'Seeker', icon: User },
]

const REDIRECT = {
  donor: '/donor/dashboard',
  admin: '/admin/dashboard',
  hospital: '/hospital/dashboard',
  seeker: '/seeker/request',
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState('donor')
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fillDemo = () => {
    const demo = DEMO_CREDENTIALS[selectedRole]
    setForm({ email: demo.email, password: demo.password })
    setErrors({})
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setErrors({})
    try {
      const data = await login(form.email, form.password, selectedRole)
      if (data.success) {
        toast('Welcome back to BloodConnect!', { type: 'success', title: 'Signed in' })
        navigate(REDIRECT[data.user.role] || REDIRECT[selectedRole])
      } else if (data.rejected) {
        setErrors({ general: 'Your account has been rejected by the admin. Please contact support.' })
      } else if (data.requires_approval) {
        setErrors({ general: 'Your account is under review. Please wait for admin approval.' })
      } else {
        setErrors({ general: data.message || 'Login failed. Please try again.' })
      }
    } catch (err) {
      setErrors({ general: err?.message || 'Network error. Make sure the server is running.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 shadow-md dark:border-slate-700 dark:bg-slate-800">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mt-6 flex flex-col items-center text-center">
          <Heart className="h-10 w-10 text-red-600" fill="currentColor" />
          <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-slate-100">
            BloodConnect
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Login to your account
          </p>
        </div>

        {/* Role selector */}
        <div className="mt-6 grid grid-cols-4 gap-2 rounded-md bg-gray-100 p-1 dark:bg-slate-700/50">
          {ROLES.map((r) => {
            const active = selectedRole === r.key
            return (
              <button
                key={r.key}
                onClick={() => setSelectedRole(r.key)}
                className={`flex flex-col items-center gap-1 rounded-md py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-white text-red-600 shadow-sm dark:bg-slate-600 dark:text-red-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <r.icon className="h-4 w-4" />
                {r.label}
              </button>
            )
          })}
        </div>

        {/* Demo credentials banner */}
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <Key className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Demo credentials available
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300/80">
                  {DEMO_CREDENTIALS[selectedRole].email}
                </p>
              </div>
            </div>
            <button
              onClick={fillDemo}
              className="shrink-0 rounded-md border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40"
            >
              Use Demo Account
            </button>
          </div>
        </div>

        {/* General error alert */}
        {errors.general && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            leftIcon={Mail}
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            leftIcon={Lock}
            rightIcon={showPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowPassword((s) => !s)}
            rightIconLabel={showPassword ? 'Hide password' : 'Show password'}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />
          <div className="text-right">
            <a href="#" className="text-sm font-medium text-red-600 dark:text-red-400">
              Forgot password?
            </a>
          </div>
          <Button type="submit" fullWidth loading={isLoading}>
            {isLoading ? 'Signing in…' : 'Login'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <span className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
          <span className="text-xs font-medium text-gray-400 dark:text-slate-500">OR</span>
          <span className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
        </div>

        {/* Social buttons */}
        <div className="flex flex-col gap-3">
          <button className="flex items-center justify-center gap-3 rounded-md border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
            <GoogleIcon /> Continue with Google
          </button>
          <button className="flex items-center justify-center gap-3 rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            <span className="font-serif text-lg font-bold leading-none">f</span>
            Continue with Facebook
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-red-600 dark:text-red-400">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
