import { useState } from 'react'
import { Droplet, Phone, CheckCircle, Info } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/shared/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../../utils/constants'
import { api } from '../../utils/apiService'
import { useToast } from '../../components/ui/Toast'

export default function Request() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [requestCode, setRequestCode] = useState(null)
  
  const [bloodGroup, setBloodGroup] = useState('')
  const [urgency, setUrgency] = useState('urgent')
  const [gender, setGender] = useState('male')
  
  const [form, setForm] = useState({
    patientName: '',
    relation: 'self',
    patientAge: '',
    quantity: 1,
    requiredDate: '',
    hospitalName: '',
    contactPhone: '',
    city: '',
    medicalReason: ''
  })

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!bloodGroup) {
      toast('Please select a blood group.', { type: 'error' })
      return
    }

    setSubmitting(true)
    
    try {
      const payload = {
        patientName: form.patientName,
        contactPhone: form.contactPhone,
        bloodType: bloodGroup,
        quantity: form.quantity,
        hospitalName: form.hospitalName,
        city: form.city, // Address used as city for now
        requiredDate: form.requiredDate,
        patientAge: form.patientAge,
        medicalReason: form.medicalReason,
        emergency: urgency === 'emergency'
      }
      
      const data = await api.post('/seeker/requests/create.php', payload)
      
      if (data.success) {
        setRequestCode(data.request?.request_code || 'N/A')
        setIsSubmitted(true)
        toast('Blood request created successfully', { type: 'success' })
      } else {
        toast(data.message || 'Failed to create request', { type: 'error' })
      }
    } catch (err) {
      console.error(err)
      toast('An error occurred while submitting.', { type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="flex flex-col items-center rounded-md border border-green-200 bg-green-50 p-10 text-center dark:border-green-900/50 dark:bg-green-950/20">
          <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-slate-100">Request Submitted Successfully!</h2>
          <p className="mb-6 font-mono text-lg font-semibold text-green-700 dark:text-green-400">Your Request ID: #{requestCode}</p>
          <p className="mb-8 text-gray-600 dark:text-gray-300">We'll notify you via SMS and email when a donor is matched.</p>
          <Link to="/seeker/tracking">
            <Button variant="primary">Track Your Request</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Submit Blood Request" subtitle="Fill in the details to find a donor quickly." />
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-slate-100">Patient Details</h3>
            
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Patient Name" placeholder="Full name of patient" required value={form.patientName} onChange={set('patientName')} />
              <Select label="Relation" options={[{value:'self',label:'Self'}, {value:'family',label:'Family'}, {value:'friend',label:'Friend'}, {value:'other',label:'Other'}]} required value={form.relation} onChange={set('relation')} />
              
              <Input label="Age" type="number" placeholder="Years" required value={form.patientAge} onChange={set('patientAge')} />
              
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Gender</label>
                <div className="flex gap-3">
                  {['male', 'female', 'other'].map(g => (
                    <label key={g} className={`flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 capitalize transition-colors ${gender === g ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' : 'border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700'}`}>
                      <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} className="hidden" />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="my-8">
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-slate-300">Blood Group Needed <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {BLOOD_GROUPS.map(bg => (
                  <button key={bg} type="button" onClick={() => setBloodGroup(bg)} className={`rounded-md border py-2 text-center text-sm font-bold transition-colors ${bloodGroup === bg ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Units Required" type="number" min="1" max="10" placeholder="Number of bags" required value={form.quantity} onChange={set('quantity')} />
              <Input label="Required By Date" type="date" required value={form.requiredDate} onChange={set('requiredDate')} />
              <Input label="Hospital Name" placeholder="e.g. Dhaka Medical College" required value={form.hospitalName} onChange={set('hospitalName')} />
              <Input label="Contact Phone" placeholder="+880 1XXXXXXXXX" icon={Phone} required value={form.contactPhone} onChange={set('contactPhone')} />
              <div className="sm:col-span-2">
                <Input label="City / Location" placeholder="e.g. Dhaka" required value={form.city} onChange={set('city')} />
              </div>
            </div>

            <div className="my-8">
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-slate-300">Urgency Level <span className="text-red-500">*</span></label>
              <div className="grid gap-3 sm:grid-cols-3">
                {Object.entries(URGENCY_LEVELS).map(([key, val]) => (
                  <button key={key} type="button" onClick={() => setUrgency(key)} className={`flex flex-col rounded-md border p-4 text-left transition-colors ${urgency === key ? 'border-red-600 bg-red-50 dark:border-red-500 dark:bg-red-950/30' : 'border-gray-200 hover:border-gray-300 dark:border-slate-700'}`}>
                    <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-slate-100">
                      <span className={`h-2.5 w-2.5 rounded-full ${key === 'emergency' ? 'bg-red-500' : key === 'urgent' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                      {val.label}
                    </span>
                    <span className="mt-1 pl-4.5 text-xs text-gray-500 dark:text-slate-400">
                      {key === 'emergency' ? 'Needed immediately' : key === 'urgent' ? 'Within 24 hours' : 'Within 3 days'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Medical Reason (Optional)</label>
              <textarea className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" rows="3" placeholder="Any specific instructions or medical reasons..." value={form.medicalReason} onChange={set('medicalReason')}></textarea>
            </div>

            <label className="mb-8 flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-900" required />
              <span className="text-sm text-gray-600 dark:text-slate-300">I confirm this is a genuine medical requirement and I take responsibility for the information provided.</span>
            </label>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={!bloodGroup || submitting} loading={submitting}>Submit Request</Button>
          </form>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-md border border-gray-200 bg-white p-5 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-slate-100">How It Works</h3>
            <div className="space-y-4">
              {[
                { n: '1', t: 'Submit Request', d: 'Fill the form with correct details' },
                { n: '2', t: 'Get Matched', d: 'We notify eligible donors nearby' },
                { n: '3', t: 'Contact Donor', d: 'Connect via chat when accepted' }
              ].map(step => (
                <div key={step.n} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600 dark:bg-red-900/50 dark:text-red-400">{step.n}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-200">{step.t}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-md bg-red-600 p-5 text-white shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <h3 className="font-bold">Emergency?</h3>
            </div>
            <p className="text-3xl font-bold tracking-wider">999</p>
            <p className="mt-1 text-sm text-red-100">National Emergency Helpline</p>
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-slate-100">Already have a request?</h3>
            <Link to="/seeker/tracking" className="text-sm font-medium text-red-600 hover:underline dark:text-red-400">Track Existing Request →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
