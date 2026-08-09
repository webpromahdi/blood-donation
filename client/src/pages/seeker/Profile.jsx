import { useState, useEffect } from 'react'
import { Camera, User, Lock, Save } from 'lucide-react'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { BANGLADESH_DIVISIONS } from '../../utils/constants'
import PageHeader from '../../components/shared/PageHeader'
import { api } from '../../utils/apiService'

export default function Profile() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [stats, setStats] = useState({ requests: 0 })
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    division: '',
    district: '',
    address: ''
  })
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await api.get('/seeker/profile.php')
      if (data.success && data.profile) {
        setForm({
          name: data.profile.name || '',
          phone: data.profile.phone || '',
          email: data.profile.email || '',
          division: '', 
          district: '',
          address: data.profile.address || '',
          city: data.profile.city || ''
        })
        setStats({
          requests: data.profile.total_requests || 0
        })
      } else {
        toast('Failed to load profile details', { type: 'error' })
      }
    } catch (err) {
      console.error(err)
      toast('Error loading profile', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/seeker/profile.php', form)
      if (res.success) {
        toast('Profile updated successfully!', { type: 'success' })
      } else {
        toast(res.message || 'Failed to update profile', { type: 'error' })
      }
    } catch (err) {
      console.error(err)
      toast('Error saving profile', { type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      toast('Please fill all password fields', { type: 'error' })
      return
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast('New passwords do not match', { type: 'error' })
      return
    }
    setUpdatingPassword(true)
    try {
      const res = await api.post('/seeker/change-password.php', {
        current_password: pwdForm.currentPassword,
        new_password: pwdForm.newPassword
      })
      if (res.success) {
        toast('Password updated successfully', { type: 'success' })
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast(res.message || 'Failed to update password', { type: 'error' })
      }
    } catch (err) {
      console.error(err)
      toast('Error updating password', { type: 'error' })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal information and settings." />
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-md border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="relative mx-auto mb-4 h-24 w-24">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-red-100 text-3xl font-bold text-red-600 dark:bg-red-900/50 dark:text-red-400">
                {form.name ? form.name.substring(0, 2).toUpperCase() : 'SK'}
              </div>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white transition-colors hover:bg-red-700 dark:border-slate-800">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{form.name}</h2>
            <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">Blood Seeker</p>
            
            <div className="mt-6 border-t border-gray-100 pt-6 dark:border-slate-700">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.requests}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Blood Requests Made</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Info */}
          <form onSubmit={handleSave} className="rounded-md border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <User className="h-5 w-5 text-gray-400" /> Personal Information
            </h3>
            
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Full Name" value={form.name} onChange={handleChange('name')} required />
              <Input label="Phone Number" value={form.phone} onChange={handleChange('phone')} required />
              <Input label="Email Address" type="email" value={form.email} disabled />
              
              <Select 
                label="Division" 
                value={form.division} 
                onChange={handleChange('division')}
                options={BANGLADESH_DIVISIONS.map(d => ({value:d, label:d}))} 
              />
              <Input label="City" value={form.city} onChange={handleChange('city')} />
              <div className="sm:col-span-2">
                <Input label="Address" value={form.address} onChange={handleChange('address')} />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" variant="primary" disabled={saving} loading={saving}>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </form>

          {/* Security */}
          <form onSubmit={handlePasswordChange} className="rounded-md border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Lock className="h-5 w-5 text-gray-400" /> Security Settings
            </h3>
            
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Current Password" type="password" placeholder="Enter current password" value={pwdForm.currentPassword} onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})} required />
              <div className="hidden sm:block"></div>
              <Input label="New Password" type="password" placeholder="Enter new password" value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} required />
              <Input label="Confirm New Password" type="password" placeholder="Confirm new password" value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} required />
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" variant="outline" disabled={updatingPassword} loading={updatingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
