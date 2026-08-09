import { useState, useEffect, useMemo } from 'react'
import { Download, Filter, RotateCcw } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import Table, { Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import { BLOOD_GROUPS } from '../../utils/constants'
import { api, API_BASE_URL } from '../../utils/apiService'

const STATUS_VARIANT = {
  completed: 'success',
  pending: 'warning',
  cancelled: 'neutral',
  scheduled: 'warning',
}

export default function History() {
  const [loading, setLoading] = useState(true)
  const [donations, setDonations] = useState([])
  const [stats, setStats] = useState(null)
  
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [group, setGroup] = useState('All')
  const [status, setStatus] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const data = await api.get('/donor/history.php')
      if (data.success) {
        setDonations(data.donations || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFromDate('')
    setToDate('')
    setGroup('All')
    setStatus('All')
    setCurrentPage(1)
  }

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      if (status !== 'All' && d.status?.toLowerCase() !== status.toLowerCase()) return false
      if (group !== 'All' && d.blood_type !== group) return false
      if (fromDate && d.date && new Date(d.date) < new Date(fromDate)) return false
      if (toDate && d.date && new Date(d.date) > new Date(toDate)) return false
      return true
    })
  }, [donations, status, group, fromDate, toDate])

  // Pagination logic
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage)
  const currentDonations = filteredDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const columns = [
    { key: 'num', label: '#' },
    { key: 'date', label: 'Date' },
    { key: 'hospital', label: 'Hospital' },
    { key: 'group', label: 'Blood Group' },
    { key: 'type', label: 'Type' },
    { key: 'units', label: 'Units' },
    { key: 'status', label: 'Status' },
    { key: 'cert', label: 'Certificate' },
  ]

  const handleDownload = (donationId) => {
    if (!donationId) return
    window.open(`${API_BASE_URL}/donor/certificates/download.php?donation_id=${donationId}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donation History"
        subtitle="Your complete record of life-saving donations."
      />

      {/* Filter bar */}
      <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Select
            label="Blood Group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            options={['All', ...BLOOD_GROUPS]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={['All', 'Completed', 'Pending', 'Cancelled', 'Scheduled']}
          />
          <Button variant="primary" onClick={() => setCurrentPage(1)}>
            <Filter className="h-4 w-4" />
            Apply
          </Button>
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      {!loading && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Donations', value: stats.total_donations || 0 },
            { label: 'This Year', value: stats.this_year || 0 },
            { label: 'Lives Saved', value: stats.lives_saved || 0 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-500">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={currentDonations}
        empty={loading ? "Loading history..." : "No donations found."}
        renderRow={(row, i) => (
          <>
            <Td className="font-medium text-gray-900 dark:text-slate-200">
              {(currentPage - 1) * itemsPerPage + i + 1}
            </Td>
            <Td>{row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}</Td>
            <Td>{row.hospital || 'General'}</Td>
            <Td>
              <BloodGroupBadge group={row.blood_type || 'N/A'} size="sm" />
            </Td>
            <Td className="capitalize">{row.donation_type?.replace('_', ' ') || 'Unknown'}</Td>
            <Td>{row.quantity || 1}</Td>
            <Td>
              <Badge variant={STATUS_VARIANT[row.status?.toLowerCase()] || 'neutral'} className="capitalize">
                {row.status || 'unknown'}
              </Badge>
            </Td>
            <Td>
              <Button
                variant="outline"
                size="sm"
                disabled={row.status?.toLowerCase() !== 'completed'}
                aria-label="Download certificate"
                onClick={() => handleDownload(row.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </Td>
          </>
        )}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDonations.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
