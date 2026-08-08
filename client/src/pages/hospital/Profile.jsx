import { useState, useEffect } from 'react'
import { Building2, Camera, Save, Mail, Phone, MapPin, ShieldCheck, CheckCircle, Clock } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../utils/apiService'

export default function Profile() {
  const { toast } = useToast()
  
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)

  const [form, setForm] = useState({
    name: '',
    type: 'Private', // Assuming type is mostly private unless specified, though backend doesn't return it
    registration_number: '',
    city: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    contact_person: '',
    description: '',
  })
  
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoadingData(true)
    try {
      const data = await api.get('/hospital/profile.php')
      if (data.success && data.profile) {
        setProfile(data.profile)
        const p = data.profile
        setForm({
          name: p.name || '',
          type: 'Private',
          registration_number: p.registration_number || '',
          city: p.city || '',
          address: p.address || '',
          email: p.email || '',
          phone: p.phone || '',
          website: p.website || '',
          contact_person: p.contact_person || '',
          description: '', // Not in API currently
        })
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      toast('Failed to load hospital profile data', { type: 'error' })
    } finally {
      setLoadingData(false)
    }
  }

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Hospital name is required'
    if (!form.registration_number.trim()) next.registration_number = 'Registration number is required'
    if (!form.city.trim()) next.city = 'City/Area is required'
    if (!form.address.trim()) next.address = 'Address is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Enter a valid email address'
    if (!form.phone.trim()) next.phone = 'Contact phone is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast('Please fix the highlighted fields.', { type: 'error' })
      return
    }
    setSaving(true)
    
    try {
      const res = await api.put('/hospital/profile.php', form)
      if (res.success) {
        toast('Hospital profile updated successfully.', { type: 'success' })
      } else {
        toast(res.message || 'Failed to update profile', { type: 'error' })
      }
    } catch (err) {
      console.error(err)
      toast('An error occurred while updating profile', { type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
    return <div className="p-12 text-center text-gray-500">Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hospital Profile" subtitle="Manage your hospital account information." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left card */}
        <div className="lg:col-span-1">
          <div className="rounded-md border border-gray-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
            <div className="relative inline-block">
              <div className="flex size-24 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                {form.name ? form.name.charAt(0).toUpperCase() : 'H'}
              </div>
              <button
                type="button"
                aria-label="Change logo"
                className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition-colors hover:bg-red-700"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mt-4 flex items-center justify-center gap-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
              <Building2 className="h-4 w-4 text-gray-400" />
              {profile?.name}
            </h2>

            <div className="mt-3 flex items-center justify-center gap-2">
              <Badge variant="neutral">Hospital</Badge>
              {profile?.status === 'approved' ? (
                <Badge variant="success">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="warning">
                  <Clock className="h-3.5 w-3.5" />
                  Pending
                </Badge>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 text-sm text-gray-600 dark:text-slate-300">
              <div className="flex items-center gap-3 rounded-md bg-gray-50 p-2.5 dark:bg-slate-900/50">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 rounded-md bg-gray-50 p-2.5 dark:bg-slate-900/50">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <span>{profile?.phone}</span>
              </div>
              <div className="flex items-center gap-3 rounded-md bg-gray-50 p-2.5 dark:bg-slate-900/50">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate text-left">{profile?.city}</span>
              </div>
            </div>

            <div className="mt-6 rounded-md border border-gray-100 p-4 dark:border-slate-700">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide dark:text-slate-400">
                Total Blood Requests
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">
                {profile?.total_requests || 0}
              </p>
            </div>
            
            <p className="mt-4 text-xs text-gray-400">
              Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Right card (Form) */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSave}
            className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
          >
            <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Institution Details
            </h3>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Hospital Name"
                  value={form.name}
                  onChange={set('name')}
                  error={errors.name}
                />
                <Input
                  label="Registration / License No."
                  value={form.registration_number}
                  onChange={set('registration_number')}
                  error={errors.registration_number}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  error={errors.email}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  error={errors.phone}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="City / Area"
                  value={form.city}
                  onChange={set('city')}
                  error={errors.city}
                />
                <Input
                  label="Contact Person"
                  value={form.contact_person}
                  onChange={set('contact_person')}
                  error={errors.contact_person}
                  placeholder="E.g., Dr. Jane Doe"
                />
              </div>

              <Input
                label="Full Address"
                value={form.address}
                onChange={set('address')}
                error={errors.address}
              />
              
              <Input
                label="Website URL (Optional)"
                type="url"
                value={form.website}
                onChange={set('website')}
                error={errors.website}
                placeholder="https://example.com"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  About / Description
                </label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  rows={4}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Provide details about your institution and blood bank facilities."
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4" /> Save Profile Details
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
