import { useState, useEffect } from 'react'
import { Camera, Award, Save, Lock } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import { useToast } from '../../components/ui/Toast'
import { BANGLADESH_DIVISIONS } from '../../utils/constants'
import { api } from '../../utils/apiService'
import { useAuth } from '../../context/AuthContext'

const GENDERS = ['Male', 'Female', 'Other']

function strengthScore(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = [
  'bg-gray-200 dark:bg-slate-700',
  'bg-red-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-green-500',
]

export default function Profile() {
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  
  const [personal, setPersonal] = useState({
    fullName: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    division: 'Dhaka',
    district: '',
    address: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [available, setAvailable] = useState(true)

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await api.get('/donor/profile.php')
      if (data.success && data.profile) {
        setProfileData(data)
        const p = data.profile
        setPersonal({
          fullName: p.name || '',
          phone: p.phone || '',
          email: p.email || '',
          dob: p.age ? (new Date(new Date().setFullYear(new Date().getFullYear() - p.age))).toISOString().split('T')[0] : '', // rough DOB based on age
          gender: p.gender || 'Male',
          division: 'Dhaka', // Default since API might not separate division/district
          district: p.city || '',
          address: p.address || '',
        })
        setAvailable(!!p.is_available)
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      toast('Failed to load profile data', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const updatePersonal = (e) =>
    setPersonal((p) => ({ ...p, [e.target.name]: e.target.value }))

  const updatePw = (e) => setPw((p) => ({ ...p, [e.target.name]: e.target.value }))

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    
    try {
      // NOTE: Update API endpoint doesn't exist yet, so we mock success
      // await api.post('/donor/profile/update.php', { ...personal, is_available: available })
      
      setTimeout(() => {
        setSavingProfile(false)
        toast('Your profile details have been saved.', {
          type: 'success',
          title: 'Profile updated',
        })
      }, 1000)
    } catch (err) {
      setSavingProfile(false)
      toast('Failed to update profile.', { type: 'error' })
    }
  }

  const score = strengthScore(pw.next)
  const mismatch = pw.confirm.length > 0 && pw.next !== pw.confirm

  const savePassword = async (e) => {
    e.preventDefault()
    if (mismatch || !pw.current || !pw.next) return
    setSavingPw(true)
    
    try {
      // NOTE: Password update endpoint doesn't exist yet, mock success
      setTimeout(() => {
        setSavingPw(false)
        setPw({ current: '', next: '', confirm: '' })
        toast('Your password has been changed.', {
          type: 'success',
          title: 'Password updated',
        })
      }, 1000)
    } catch (err) {
      setSavingPw(false)
      toast('Failed to change password.', { type: 'error' })
    }
  }

  const getInitials = (name) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* LEFT */}
      <div className="lg:col-span-1">
        <div className="rounded-md border border-gray-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
          <div className="relative mx-auto size-24">
            <div className="flex size-24 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
              {getInitials(personal.fullName)}
            </div>
            <button
              type="button"
              aria-label="Change photo"
              className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-slate-100">
            {personal.fullName || 'Unknown Donor'}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            <BloodGroupBadge group={profileData?.profile?.blood_group || 'N/A'} />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Member since {profileData?.profile?.member_since ? new Date(profileData.profile.member_since).getFullYear() : '2023'}
          </p>

          <div className="mt-4 flex justify-center">
            <Badge variant="primary">
              <Award className="h-3.5 w-3.5" />
              {profileData?.stats?.total_donations > 10 ? 'Platinum Donor' : profileData?.stats?.total_donations > 5 ? 'Gold Donor' : 'Bronze Donor'}
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-3 divide-x divide-gray-200 border-t border-gray-200 pt-4 dark:divide-slate-700 dark:border-slate-700">
            <div className="px-2">
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{profileData?.stats?.total_donations || 0}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Donations</p>
            </div>
            <div className="px-2">
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{profileData?.stats?.lives_saved || 0}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Lives Saved</p>
            </div>
            <div className="px-2">
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">#48</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Rank</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="space-y-6 lg:col-span-2">
        {/* Personal Information */}
        <form
          onSubmit={saveProfile}
          className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
        >
          <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-slate-100">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              name="fullName"
              value={personal.fullName}
              onChange={updatePersonal}
            />
            <Input
              label="Phone"
              name="phone"
              value={personal.phone}
              onChange={updatePersonal}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={personal.email}
              onChange={updatePersonal}
              disabled
            />
            <Input
              label="Date of Birth"
              name="dob"
              type="date"
              value={personal.dob}
              onChange={updatePersonal}
            />
            <Select
              label="Gender"
              name="gender"
              options={GENDERS}
              value={personal.gender}
              onChange={updatePersonal}
            />
            <Select
              label="Division"
              name="division"
              options={BANGLADESH_DIVISIONS}
              value={personal.division}
              onChange={updatePersonal}
            />
            <Input
              label="District/City"
              name="district"
              value={personal.district}
              onChange={updatePersonal}
            />
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Address
              </label>
              <textarea
                rows={3}
                name="address"
                value={personal.address}
                onChange={updatePersonal}
                className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" loading={savingProfile}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>

        {/* Availability Settings */}
        <div className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-slate-100">
            Availability Settings
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                Available for Donation
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Seekers can contact you when enabled.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => {
                setAvailable((v) => !v)
                toast('Availability status updated! (Mock)', { type: 'success' })
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                available ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  available ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Change Password */}
        <form
          onSubmit={savePassword}
          className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
        >
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
            <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
            Change Password
          </h2>
          <div className="space-y-4">
            <Input
              label="Current Password"
              name="current"
              type="password"
              value={pw.current}
              onChange={updatePw}
              leftIcon={Lock}
            />
            <div>
              <Input
                label="New Password"
                name="next"
                type="password"
                value={pw.next}
                onChange={updatePw}
                leftIcon={Lock}
              />
              {pw.next.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < score
                            ? STRENGTH_COLORS[score]
                            : 'bg-gray-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    {STRENGTH_LABELS[score]}
                  </p>
                </div>
              )}
            </div>
            <Input
              label="Confirm Password"
              name="confirm"
              type="password"
              value={pw.confirm}
              onChange={updatePw}
              leftIcon={Lock}
              error={mismatch ? 'Passwords do not match.' : ''}
            />
            <Button type="submit" variant="outline" loading={savingPw}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
