import { useState } from 'react'
import {
  Search,
  CheckCircle,
  MapPin,
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import { api } from '../../utils/apiService'

export default function TrackRequest() {
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState([])

  const handleTrack = async (e) => {
    e?.preventDefault()
    if (!searchValue.trim()) return

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const isPhone = /^[0-9+]+$/.test(searchValue.trim())
      const endpoint = isPhone 
        ? `/guest/track.php?phone=${encodeURIComponent(searchValue.trim())}`
        : `/guest/track.php?code=${encodeURIComponent(searchValue.trim())}`

      const data = await api.get(endpoint)
      if (data.success && data.requests) {
        setResults(data.requests)
      } else {
        setError(data.message || 'No request found.')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred while tracking the request.')
    } finally {
      setLoading(false)
    }
  }

  const getProgressState = (currentStatus, stepIndex) => {
    const statuses = ['pending', 'approved', 'donor_assigned', 'on_the_way', 'reached', 'completed']
    const rejectedStatuses = ['rejected', 'cancelled']
    
    // Map backend status to 4 steps
    let currentStep = 0
    if (currentStatus === 'pending') currentStep = 0
    else if (currentStatus === 'approved') currentStep = 1
    else if (['donor_assigned', 'on_the_way', 'reached'].includes(currentStatus)) currentStep = 2
    else if (currentStatus === 'completed') currentStep = 3

    if (rejectedStatuses.includes(currentStatus)) {
      return stepIndex === 0 ? 'past' : 'future' // Only "submitted" is past, rest are future
    }

    if (stepIndex < currentStep) return 'past'
    if (stepIndex === currentStep) return 'current'
    return 'future'
  }

  const STEPS = ['Submitted', 'Under Review', 'Matched', 'Fulfilled']

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-12">
      {/* Search card */}
      <div className="w-full max-w-lg rounded-md border border-gray-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800 shadow-[var(--shadow-card)]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Track Your Blood Request
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
          Enter the request ID (e.g., REQ-1234) or phone number to check its current status.
        </p>
        <form onSubmit={handleTrack} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            name="searchValue"
            leftIcon={Search}
            placeholder="Request ID or Phone"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1"
          />
          <Button variant="primary" type="submit" disabled={!searchValue.trim() || loading} loading={loading}>
            Track
          </Button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      {/* Result cards */}
      {results.length > 0 && (
        <div className="mt-8 w-full max-w-2xl space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {results.length} Request{results.length !== 1 ? 's' : ''} Found
          </h3>

          {results.map((req, index) => (
            <div key={index} className="rounded-md border border-gray-200 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800">
              {/* Top row */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="neutral">{req.request_code}</Badge>
                <BloodGroupBadge group={req.blood_type} size="md" />
                <Badge variant={['rejected', 'cancelled'].includes(req.status) ? 'error' : 'info'} size="md" className="ml-auto">
                  {req.status_label}
                </Badge>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {req.patient_name} <span className="text-sm font-normal text-gray-500">({req.quantity} Units)</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                  <MapPin className="h-4 w-4" />
                  {req.hospital_name}
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  Requested on {req.created_at?.split(' ')[0]}
                </p>
              </div>

              {/* Status Message */}
              <div className="mt-4 flex items-start gap-3 rounded-md bg-gray-50 p-4 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800">
                <Info className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-200">Current Status</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{req.status_message}</p>
                </div>
              </div>

              {/* Progress timeline */}
              {!['rejected', 'cancelled'].includes(req.status) && (
                <div className="mt-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-0">
                    {STEPS.map((stepLabel, i) => {
                      const isLast = i === STEPS.length - 1
                      const state = getProgressState(req.status, i)
                      const circle =
                        state === 'past'
                          ? 'bg-red-600 text-white'
                          : state === 'current'
                            ? 'bg-white text-red-600 ring-2 ring-red-600 dark:bg-slate-800'
                            : 'bg-gray-200 text-gray-400 dark:bg-slate-700 dark:text-slate-500'
                      return (
                        <div
                          key={stepLabel}
                          className="flex items-start gap-3 sm:flex-1 sm:flex-col sm:items-center sm:gap-0"
                        >
                          <div className="flex items-center sm:w-full sm:flex-col">
                            <div className="flex items-center sm:w-full sm:justify-center">
                              {/* connector left (desktop) */}
                              <span
                                className={`hidden h-0.5 flex-1 sm:block ${
                                  i === 0
                                    ? 'invisible'
                                    : state === 'future' && getProgressState(req.status, i-1) === 'future'
                                      ? 'bg-gray-200 dark:bg-slate-700'
                                      : 'bg-red-600'
                                }`}
                              />
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${circle}`}
                              >
                                {state === 'past' ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  i + 1
                                )}
                              </div>
                              {/* connector right (desktop) */}
                              <span
                                className={`hidden h-0.5 flex-1 sm:block ${
                                  isLast
                                    ? 'invisible'
                                    : state === 'future'
                                      ? 'bg-gray-200 dark:bg-slate-700'
                                      : 'bg-red-600'
                                }`}
                              />
                            </div>
                          </div>
                          <span
                            className={`text-sm sm:mt-2 sm:text-center ${
                              state === 'future'
                                ? 'text-gray-400 dark:text-slate-500'
                                : 'font-medium text-gray-900 dark:text-white'
                            }`}
                          >
                            {stepLabel}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
