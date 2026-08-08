import { useState, useEffect } from 'react'
import { Heart, CheckCircle, Download, Share2, Award } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import { api, API_BASE_URL } from '../../utils/apiService'
import { Link } from 'react-router-dom'

export default function Certificates() {
  const [loading, setLoading] = useState(true)
  const [certs, setCerts] = useState([])
  const [donorName, setDonorName] = useState('')

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      // Certificates come from completed donations in the history endpoint
      const data = await api.get('/donor/history.php')
      if (data.success) {
        setDonorName(data.donor?.name || '')
        const completedWithCerts = (data.donations || [])
          .filter(d => d.status === 'completed' && d.certificate)
          .map(d => d.certificate)
        setCerts(completedWithCerts)
      }
    } catch (err) {
      console.error('Failed to load certificates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (certId) => {
    window.open(`${API_BASE_URL}/donor/certificates/download.php?id=${certId}`, '_blank')
  }

  const handleShare = async (cert) => {
    const url = `${API_BASE_URL}/donor/certificates/download.php?id=${cert.cert_id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Blood Donation Certificate',
          text: `I just donated blood at ${cert.hospital}! Join me in saving lives.`,
          url: url
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback for browsers without share API
      navigator.clipboard.writeText(`Check out my blood donation certificate: ${url}`)
      alert('Certificate link copied to clipboard!')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading certificates...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Certificates"
        subtitle="Download and share your donation certificates."
      />

      {certs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => (
            <div
              key={cert.cert_id}
              className="flex h-full flex-col rounded-md border-t-4 border-red-600 bg-white p-5 shadow-sm dark:bg-slate-800"
            >
              <div className="flex justify-center">
                <Badge variant="primary" size="sm">
                  Certificate of Appreciation
                </Badge>
              </div>

              <h3 className="mt-3 text-center text-sm font-bold uppercase tracking-wide text-gray-800 dark:text-slate-100">
                Blood Donation Certificate
              </h3>

              {/* divider with centered heart */}
              <div className="my-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-gray-200 dark:bg-slate-600" />
                <Heart className="h-5 w-5 fill-red-600 text-red-600" />
                <span className="h-px flex-1 bg-gray-200 dark:bg-slate-600" />
              </div>

              <p className="text-center text-xl font-semibold text-gray-900 dark:text-slate-100">
                {cert.donor_name || donorName}
              </p>
              <p className="mt-1 text-center text-sm text-gray-600 dark:text-slate-400">
                {cert.date ? new Date(cert.date).toLocaleDateString() : 'Unknown Date'} · {cert.hospital}
              </p>

              <div className="mt-3 flex justify-center">
                <BloodGroupBadge group={cert.blood_group || 'N/A'} size="md" />
              </div>

              <p className="mt-3 text-center text-xs text-gray-500 dark:text-slate-400">
                Certificate No: <span className="font-medium">{cert.cert_id}</span>
              </p>

              <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-green-600 dark:text-green-500">
                <CheckCircle className="h-4 w-4" />
                <span>Verified Authentic</span>
              </div>

              <div className="mt-auto flex gap-2 pt-5">
                <Button variant="primary" size="sm" fullWidth onClick={() => handleDownload(cert.cert_id)}>
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" fullWidth onClick={() => handleShare(cert)}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-slate-700">
            <Award className="h-8 w-8 text-red-600 dark:text-red-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
            No certificates yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Complete your first donation to earn a certificate.
          </p>
          <div className="mt-4">
            <Button as={Link} to="/donor/voluntary" variant="primary">Start Donating</Button>
          </div>
        </div>
      )}
    </div>
  )
}
