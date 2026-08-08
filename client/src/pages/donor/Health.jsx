import { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  Droplets,
  Activity,
  Calendar,
  X,
  Plus,
  Info,
  Save,
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../utils/apiService'

const CONDITION_MAP = {
  'Diabetes': 'has_diabetes',
  'Hypertension': 'has_hypertension',
  'Heart Disease': 'has_heart_disease',
  'Blood Disorders': 'has_blood_disorders',
  'Infectious Disease': 'has_infectious_disease',
  'Asthma': 'has_asthma',
  'Allergies': 'has_allergies',
  'Recent Surgery': 'has_recent_surgery'
}

const CONDITION_OPTIONS = Object.keys(CONDITION_MAP)

const HEALTH_TIPS = [
  {
    icon: Droplets,
    title: 'Stay hydrated',
    tip: 'Drink at least 3 litres of water the day before you donate.',
  },
  {
    icon: Activity,
    title: 'Iron-rich foods',
    tip: 'Eat spinach, lentils and red meat to keep haemoglobin healthy.',
  },
  {
    icon: Calendar,
    title: 'Regular checkup',
    tip: 'Get a full health screening at least once every six months.',
  },
]

export default function Health() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [healthData, setHealthData] = useState(null)
  
  const [form, setForm] = useState({
    weight: '',
    height: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    hemoglobin: '',
    last_medical_checkup: '',
  })
  
  const [conditions, setConditions] = useState([])
  const [newCondition, setNewCondition] = useState('')
  const [allergiesDetails, setAllergiesDetails] = useState('')
  const [medications, setMedications] = useState('')
  
  const [eligibility, setEligibility] = useState([])

  useEffect(() => {
    fetchHealthData()
  }, [])

  const fetchHealthData = async () => {
    try {
      const data = await api.get('/donor/health.php')
      if (data.success && data.health) {
        setHealthData(data.health)
        setForm({
          weight: data.health.weight || '',
          height: data.health.height || '',
          blood_pressure_systolic: data.health.blood_pressure_systolic || '',
          blood_pressure_diastolic: data.health.blood_pressure_diastolic || '',
          hemoglobin: data.health.hemoglobin || '',
          last_medical_checkup: data.health.last_medical_checkup || '',
        })
        
        // Map boolean fields back to condition array
        const activeConditions = []
        Object.entries(CONDITION_MAP).forEach(([label, key]) => {
          if (data.health[key]) activeConditions.push(label)
        })
        setConditions(activeConditions)
        
        setAllergiesDetails(data.health.additional_notes || '') // Note: assuming additional_notes holds allergies details, or we can use allergies_details directly if returned
        setMedications(data.health.is_on_medication ? 'Yes' : '') // Adjust as needed
        
        // Check eligibility list
        setEligibility([
          { label: 'Weight above 50 kg', met: parseFloat(data.health.weight) >= 50 },
          { label: 'Hemoglobin 12.5+ g/dL', met: parseFloat(data.health.hemoglobin) >= 12.5 },
          { label: 'Eligible based on interval', met: data.eligibility?.is_eligible ?? true },
          { label: 'No critical illness', met: !data.health.has_heart_disease && !data.health.has_infectious_disease }
        ])
      }
    } catch (err) {
      toast('Failed to load health data.', { type: 'error', title: 'Error' })
    } finally {
      setFetching(false)
    }
  }

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const weight = parseFloat(form.weight)
  const height = parseFloat(form.height)
  const bmiNum = weight > 0 && height > 0 ? (weight / (height / 100) ** 2) : NaN
  const bmi = isNaN(bmiNum) ? '--' : bmiNum.toFixed(1)
  const bmiColor = isNaN(bmiNum)
    ? 'text-gray-500 dark:text-slate-400'
    : bmiNum >= 18.5 && bmiNum <= 25
      ? 'text-green-600 dark:text-green-400'
      : bmiNum < 18.5
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400'

  const addCondition = () => {
    const value = newCondition.trim()
    if (value && !conditions.includes(value)) {
      setConditions((c) => [...c, value])
    }
    setNewCondition('')
  }

  const removeCondition = (c) =>
    setConditions((prev) => prev.filter((x) => x !== c))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Construct payload
    const payload = {
      weight: form.weight,
      height: form.height,
      blood_pressure_systolic: form.blood_pressure_systolic,
      blood_pressure_diastolic: form.blood_pressure_diastolic,
      hemoglobin: form.hemoglobin,
      last_medical_checkup: form.last_medical_checkup,
      allergies_details: allergiesDetails,
      medications: medications,
      is_on_medication: medications.trim().length > 0
    }
    
    // Add boolean condition flags
    Object.entries(CONDITION_MAP).forEach(([label, key]) => {
      payload[key] = conditions.includes(label)
    })
    
    try {
      const data = await api.post('/donor/health/update.php', payload)
      if (data.success) {
        toast('Your health profile has been updated.', {
          type: 'success',
          title: 'Saved',
        })
        fetchHealthData() // Refresh to update eligibility status
      } else {
        toast(data.message || 'Failed to update health profile.', { type: 'error', title: 'Error' })
      }
    } catch (err) {
      toast('Network error occurred.', { type: 'error', title: 'Error' })
    } finally {
      setLoading(false)
    }
  }

  const availableConditions = CONDITION_OPTIONS.filter(
    (c) => !conditions.includes(c),
  )

  if (fetching) {
    return <div className="p-8 text-center text-gray-500">Loading health data...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health Information"
        subtitle="Keep your health profile up to date to stay eligible."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <form
          onSubmit={handleSubmit}
          className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 lg:col-span-2"
        >
          <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-slate-100">
            Health Information
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Blood Group
              </label>
              <input
                value={healthData?.blood_group || 'N/A'}
                disabled
                readOnly
                className="h-10 w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 px-4 text-sm font-semibold text-gray-700 opacity-80 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>

            <Input
              label="Weight (kg)"
              type="number"
              name="weight"
              value={form.weight}
              onChange={update}
            />

            <Input
              label="Height (cm)"
              type="number"
              name="height"
              value={form.height}
              onChange={update}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                BMI
              </label>
              <div className="flex h-10 items-center rounded-md border border-gray-300 bg-gray-50 px-4 dark:border-slate-600 dark:bg-slate-900">
                <span className={`text-sm font-semibold ${bmiColor}`}>{bmi}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Blood Pressure (mmHg)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="blood_pressure_systolic"
                  value={form.blood_pressure_systolic}
                  onChange={update}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <span className="text-gray-400 dark:text-slate-500">/</span>
                <input
                  type="number"
                  name="blood_pressure_diastolic"
                  value={form.blood_pressure_diastolic}
                  onChange={update}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <Input
              label="Hemoglobin (g/dL)"
              type="number"
              step="0.1"
              name="hemoglobin"
              value={form.hemoglobin}
              onChange={update}
            />

            {/* Medical Conditions */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Medical Conditions
              </label>
              {conditions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {conditions.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950/50 dark:text-red-300"
                    >
                      {c}
                      <button
                         type="button"
                        onClick={() => removeCondition(c)}
                        aria-label={`Remove ${c}`}
                        className="rounded-full p-0.5 hover:bg-red-100 dark:hover:bg-red-900/50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <Select
                  className="flex-1"
                  placeholder="Select a condition"
                  options={availableConditions}
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addCondition}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Allergies Details
              </label>
              <textarea
                rows={3}
                value={allergiesDetails}
                onChange={(e) => setAllergiesDetails(e.target.value)}
                className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Medications
              </label>
              <textarea
                rows={3}
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <Input
              label="Last Medical Checkup"
              type="date"
              name="last_medical_checkup"
              value={form.last_medical_checkup}
              onChange={update}
              className="sm:col-span-2"
            />
          </div>

          <div className="mt-6">
            <Button type="submit" variant="primary" loading={loading}>
              <Save className="h-4 w-4" />
              Save Health Info
            </Button>
          </div>
        </form>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
              Eligibility Status
            </h2>
            
            {eligibility.every(e => e.met) ? (
              <div className="mb-5 flex items-center gap-3 rounded-md bg-green-50 p-4 dark:bg-green-950/30">
                <CheckCircle className="h-8 w-8 shrink-0 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    Eligible to Donate
                  </p>
                  <p className="text-xs text-green-600/80 dark:text-green-400/70">
                    You meet all requirements.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-5 flex items-center gap-3 rounded-md bg-red-50 p-4 dark:bg-red-950/30">
                <XCircle className="h-8 w-8 shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-300">
                    Not Eligible Currently
                  </p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/70">
                    Please see reasons below.
                  </p>
                </div>
              </div>
            )}
            
            <ul className="space-y-3">
              {eligibility.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-slate-300"
                >
                  {item.met ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                  )}
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
              <Info className="h-5 w-5 text-red-600 dark:text-red-400" />
              Health Tips
            </h2>
            <div className="space-y-4">
              {HEALTH_TIPS.map(({ icon: Icon, title, tip }) => (
                <div key={title} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
