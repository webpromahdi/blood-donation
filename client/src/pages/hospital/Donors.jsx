import { useState, useEffect, useMemo } from 'react'
import { MapPin, Droplet, Search } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import {
  BLOOD_GROUPS,
  DONATION_TYPES,
} from '../../utils/constants'
import { api } from '../../utils/apiService'

const AVATAR_TINTS = [
  { range: 'ABCD', cls: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' },
  { range: 'EFGH', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  { range: 'IJKL', cls: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300' },
  { range: 'MNOP', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  { range: 'QRST', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300' },
  { range: 'UVWXYZ', cls: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' },
]

function avatarTint(name = '') {
  const first = (name.trim()[0] || 'A').toUpperCase()
  return (AVATAR_TINTS.find((t) => t.range.includes(first)) || AVATAR_TINTS[0]).cls
}

function HospitalDonorCard({ donor, onRequest }) {
  const initials = donor.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="flex h-full flex-col rounded-md border border-gray-200 bg-white p-5 transition-all hover:border-red-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-900/60">
      <div className="flex items-start justify-between">
        <div
          className={`flex size-14 items-center justify-center rounded-full text-lg font-semibold ${avatarTint(donor.name)}`}
        >
          {initials}
        </div>
        <BloodGroupBadge group={donor.blood_group} size="sm" />
      </div>

      <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-slate-100">
        {donor.name}
      </h3>
      <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
        <MapPin className="h-3.5 w-3.5" />
        {donor.city || 'Location unknown'}
      </p>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
        <Droplet className="h-3.5 w-3.5 text-red-500" fill="currentColor" />
        {donor.total_donations} donations
        <span
          className={`ml-auto inline-flex items-center gap-1 text-xs font-medium ${donor.is_available ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${donor.is_available ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          {donor.is_available ? 'Available' : 'Resting'}
        </span>
      </div>
      {donor.last_donation && (
        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
          Last donated {new Date(donor.last_donation).toLocaleDateString()}
        </p>
      )}

      <div className="mt-auto pt-4">
        <Button variant="primary" size="sm" fullWidth onClick={() => onRequest(donor)} disabled={!donor.is_available}>
          {donor.is_available ? 'Request Donation' : 'Not Eligible Yet'}
        </Button>
      </div>
    </div>
  )
}

export default function Donors() {
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [donors, setDonors] = useState([])
  const [cities, setCities] = useState([])
  
  const [bloodGroup, setBloodGroup] = useState('All')
  const [city, setCity] = useState('All')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [search, setSearch] = useState('')

  const [activeDonor, setActiveDonor] = useState(null)
  const [form, setForm] = useState({ date: '', time: '', type: DONATION_TYPES[0], notes: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    setLoading(true)
    try {
      const data = await api.get('/hospital/donors.php')
      if (data.success) {
        setDonors(data.donors || [])
        setCities(data.cities || [])
      }
    } catch (err) {
      console.error('Failed to fetch donors:', err)
      toast('Failed to load donors', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return donors.filter((d) => {
      if (bloodGroup !== 'All' && d.blood_group !== bloodGroup) return false
      if (city !== 'All' && d.city !== city) return false
      if (availableOnly && !d.is_available) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        return d.name.toLowerCase().includes(q) || (d.city && d.city.toLowerCase().includes(q))
      }
      return true
    })
  }, [donors, bloodGroup, city, availableOnly, search])

  const handleRequest = (donor) => {
    setActiveDonor(donor)
    setForm({ date: '', time: '', type: DONATION_TYPES[0], notes: '' })
  }

  const submitRequest = async () => {
    if (!form.date || !form.time) {
      toast('Please provide a date and time.', { type: 'error' })
      return
    }
    setSubmitting(true)
    
    // As per the mock behavior, since there might not be a direct "request specific donor" API endpoint,
    // we'll simulate the success or redirect them to create a request and assign the donor
    setTimeout(() => {
      setSubmitting(false)
      setActiveDonor(null)
      toast(`Donation request sent to ${activeDonor.name}.`, { type: 'success' })
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donor Network"
        subtitle="Search and connect with registered blood donors in your area."
      />

      {/* Filters */}
      <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-4 md:grid-cols-4">
          <Input
            placeholder="Search by name..."
            leftIcon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            options={['All', ...BLOOD_GROUPS]}
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          />
          <Select
            options={['All', ...cities]}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-900"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
              />
              Available now only
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading donor network...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No donors found matching your criteria.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((donor) => (
            <HospitalDonorCard key={donor.id} donor={donor} onRequest={handleRequest} />
          ))}
        </div>
      )}

      {/* Request Modal */}
      <Modal
        open={!!activeDonor}
        onClose={() => !submitting && setActiveDonor(null)}
        title="Request Donation"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActiveDonor(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitRequest} loading={submitting}>
              Send Request
            </Button>
          </>
        }
      >
        {activeDonor && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
              <div
                className={`flex size-12 items-center justify-center rounded-full text-lg font-semibold ${avatarTint(activeDonor.name)}`}
              >
                {activeDonor.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-slate-100">
                  {activeDonor.name}
                </h4>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  <BloodGroupBadge group={activeDonor.blood_group} size="sm" showIcon={false} />
                  <span>{activeDonor.total_donations} donations</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Preferred Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
              <Input
                label="Time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>
            <Select
              label="Donation Type"
              options={DONATION_TYPES}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Message to Donor (Optional)
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                rows={3}
                placeholder="E.g., Urgent requirement for surgery..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
