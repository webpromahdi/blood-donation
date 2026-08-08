import { useState, useEffect } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/shared/PageHeader'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { STATUS_COLORS, URGENCY_LEVELS } from '../../utils/constants'
import { api } from '../../utils/apiService'
import { useToast } from '../../components/ui/Toast'

export default function Tracking() {
  const [filter, setFilter] = useState('All')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await api.get('/seeker/requests.php')
      if (data.success) {
        setRequests(data.requests)
      } else {
        toast(data.message || 'Failed to fetch requests', { type: 'error' })
      }
    } catch (err) {
      console.error(err)
      toast('An error occurred while loading requests.', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const getProgress = (lifecycleStatus) => {
    switch (lifecycleStatus) {
      case 'pending': return 1;
      case 'approved': return 2;
      case 'donor_assigned':
      case 'on_the_way':
      case 'reached': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  }

  const getStatusLabel = (lifecycleStatus) => {
    switch (lifecycleStatus) {
      case 'pending': return 'Submitted';
      case 'approved': return 'Under Review';
      case 'donor_assigned': return 'Matched';
      case 'on_the_way': return 'Matched (On the way)';
      case 'reached': return 'Matched (Reached)';
      case 'completed': return 'Fulfilled';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      default: return lifecycleStatus;
    }
  }

  const filtered = requests.filter(r => {
    if (filter !== 'All') {
      const displayStatus = getStatusLabel(r.lifecycle_status);
      // Simplify logic for filtering: Match substring or exact based on filter name
      if (filter === 'Pending' && r.lifecycle_status !== 'pending') return false;
      if (filter === 'Matched' && !['donor_assigned', 'on_the_way', 'reached'].includes(r.lifecycle_status)) return false;
      if (filter === 'Fulfilled' && r.lifecycle_status !== 'completed') return false;
      if (filter === 'Cancelled' && !['cancelled', 'rejected'].includes(r.lifecycle_status)) return false;
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!r.request_code?.toLowerCase().includes(s) && !r.patient_name?.toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  })

  return (
    <div>
      <PageHeader title="Track Requests" subtitle="Monitor the status of your blood requests." />
      
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['All', 'Pending', 'Matched', 'Fulfilled', 'Cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === f ? 'bg-red-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <Input icon={Search} placeholder="Request ID or Patient Name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-gray-500 dark:text-gray-400">No requests found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => {
            const progress = getProgress(req.lifecycle_status);
            const statusLabel = getStatusLabel(req.lifecycle_status);
            const statusColor = STATUS_COLORS[req.status] || 'neutral';

            return (
              <div key={req.id} className="rounded-md border border-gray-200 bg-white p-5 shadow-[var(--shadow-card)] dark:border-slate-700 dark:bg-slate-800 flex flex-col h-full">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="neutral">{req.request_code}</Badge>
                    <Badge variant="primary">{req.blood_type}</Badge>
                    <Badge variant={URGENCY_LEVELS[req.urgency]?.color || 'neutral'} dot>{URGENCY_LEVELS[req.urgency]?.label || req.urgency}</Badge>
                  </div>
                  <Badge variant={statusColor} className="capitalize">{statusLabel}</Badge>
                </div>
                
                {['cancelled', 'rejected'].includes(req.lifecycle_status) ? (
                  <div className="py-6 text-center text-sm font-medium text-red-500">
                    This request was {req.lifecycle_status}.
                  </div>
                ) : (
                  <div className="py-6">
                    <div className="relative flex justify-between">
                      <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 border-t-2 border-dashed border-gray-200 dark:border-slate-700" />
                      {['Submitted', 'Under Review', 'Matched', 'Fulfilled'].map((step, i) => {
                        const stepNum = i + 1;
                        const isPast = stepNum < progress;
                        const isCurrent = stepNum === progress;
                        return (
                          <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2 dark:bg-slate-800">
                            <div className={`flex h-4 w-4 items-center justify-center rounded-full ${isPast ? 'bg-red-600' : isCurrent ? 'bg-red-600 ring-4 ring-red-100 dark:ring-red-900/50' : 'bg-gray-300 dark:bg-slate-600'}`} />
                            <span className={`hidden text-xs font-medium sm:block ${isCurrent ? 'text-red-600' : 'text-gray-500 dark:text-slate-400'}`}>{step}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
  
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    <span className="font-medium text-gray-900 dark:text-slate-200">{req.patient_name}</span> • {req.hospital_name} • {req.created_at?.split(' ')[0]}
                  </div>
                  <Link to={`/seeker/request/${req.id}`}>
                    <Button variant="outline" size="sm">
                      View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
