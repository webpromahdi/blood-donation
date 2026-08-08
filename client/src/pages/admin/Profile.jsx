import { useState, useEffect } from 'react'
import { Camera, Save, Lock } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'

function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
        on ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          on ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

const CARD =
  'rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800'

export default function Profile() {
  const { toast } = useToast()
  const { user } = useAuth()

  // Personal info
  const [info, setInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: '',
  })
  
  useEffect(() => {
    if (user) {
      setInfo({
        fullName: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'Admin',
      })
    }
  }, [user])

  const [savingInfo, setSavingInfo] = useState(false)

  // Preferences
  const [prefs, setPrefs] = useState({ email: true, sms: false, alerts: true })
  const [theme, setTheme] = useState('System')

  // Password
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  const strength = (() => {
    const p = pwd.next
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  
  const strengthLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][
    strength
  ]
  const mismatch = pwd.confirm.length > 0 && pwd.next !== pwd.confirm

  const setField = (key) => (e) => setInfo((p) => ({ ...p, [key]: e.target.value }))

  const saveInfo = (e) => {
    e.preventDefault()
    setSavingInfo(true)
    setTimeout(() => {
      setSavingInfo(false)
      toast('Personal information updated.', { title: 'Saved' })
    }, 1500)
  }

  const savePrefs = () => {
    toast('Preferences saved.', { title: 'Saved' })
  }

  const updatePassword = (e) => {
    e.preventDefault()
    if (!pwd.current || !pwd.next) {
      toast('Please fill in all password fields.', { type: 'error' })
      return
    }
    if (mismatch) {
      toast('Passwords do not match.', { type: 'error' })
      return
    }
    setSavingPwd(true)
    setTimeout(() => {
      setSavingPwd(false)
      setPwd({ current: '', next: '', confirm: '' })
      toast('Password updated securely.', { title: 'Success' })
    }, 1500)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Profile Settings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Manage your account details and preferences.
        </p>
      </div>

      <div className={CARD}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400">
                {info.fullName ? info.fullName.charAt(0) : 'A'}
              </div>
              <button
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                aria-label="Change photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {info.fullName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 capitalize">{info.role}</p>
            </div>
          </div>
        </div>

        <form onSubmit={saveInfo}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={info.fullName} onChange={setField('fullName')} />
            <Input label="Email Address" type="email" value={info.email} onChange={setField('email')} disabled />
            <Input label="Phone Number" value={info.phone} onChange={setField('phone')} />
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={savingInfo}>
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>

      <div className={CARD}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
          Security
        </h3>
        <form onSubmit={updatePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={pwd.current}
            onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            placeholder="••••••••"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                label="New Password"
                type="password"
                value={pwd.next}
                onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                placeholder="••••••••"
              />
              {pwd.next.length > 0 && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-8 rounded-full ${i <= strength ? strengthColor : 'bg-gray-200 dark:bg-slate-700'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{strengthLabel}</span>
                </div>
              )}
            </div>
            <div>
              <Input
                label="Confirm New Password"
                type="password"
                value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                placeholder="••••••••"
                error={mismatch ? 'Passwords do not match' : undefined}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="secondary" loading={savingPwd}>
              <Lock className="h-4 w-4" /> Update Password
            </Button>
          </div>
        </form>
      </div>

      <div className={CARD}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
          Preferences
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">Email Notifications</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Receive reports and alerts</p>
            </div>
            <Toggle on={prefs.email} onToggle={() => setPrefs({ ...prefs, email: !prefs.email })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">SMS Alerts</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Critical system alerts</p>
            </div>
            <Toggle on={prefs.sms} onToggle={() => setPrefs({ ...prefs, sms: !prefs.sms })} />
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
             <Button onClick={savePrefs} variant="secondary">Save Preferences</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
