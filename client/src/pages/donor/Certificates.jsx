import { useState, useEffect } from 'react'
import { Heart, CheckCircle, Download, Share2, Award, Lock } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import BloodGroupBadge from '../../components/shared/BloodGroupBadge'
import { api, API_BASE_URL } from '../../utils/apiService'
import { Link } from 'react-router-dom'

const CERTIFICATE_TIERS = [
  { name: "Bronze", required: 1, color: "text-amber-700 bg-amber-100", gradient: "from-amber-500 to-amber-600" },
  { name: "Silver", required: 3, color: "text-gray-700 bg-gray-200", gradient: "from-gray-400 to-gray-500" },
  { name: "Gold", required: 5, color: "text-yellow-700 bg-yellow-100", gradient: "from-yellow-400 to-yellow-500" },
  { name: "Platinum", required: 10, color: "text-slate-700 bg-slate-200", gradient: "from-slate-500 to-slate-600" },
  { name: "Diamond", required: 25, color: "text-cyan-700 bg-cyan-100", gradient: "from-cyan-400 to-cyan-500" },
];

export default function Certificates() {
  const [loading, setLoading] = useState(true)
  const [certs, setCerts] = useState([])
  const [stats, setStats] = useState(null)
  const [donorName, setDonorName] = useState('')

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const data = await api.get('/donor/history.php')
      if (data.success) {
        setDonorName(data.donor?.name || '')
        setStats(data.stats)
        const completedWithCerts = (data.donations || [])
          .filter(d => d.status === 'completed' && d.certificate)
          .map(d => ({ ...d.certificate, donation_id: d.id }))
        setCerts(completedWithCerts)
      }
    } catch (err) {
      console.error('Failed to load certificates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (cert) => {
    window.open(`${API_BASE_URL}/donor/certificates/download.php?donation_id=${cert.donation_id}`, '_blank')
  }

  const handleShare = async (cert) => {
    const url = `${API_BASE_URL}/donor/certificates/download.php?donation_id=${cert.donation_id}`
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
      navigator.clipboard.writeText(`Check out my blood donation certificate: ${url}`)
      alert('Certificate link copied to clipboard!')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading certificates...</div>
  }

  const totalDonations = stats?.total_donations || 0
  const unlockedTiers = CERTIFICATE_TIERS.filter(tier => totalDonations >= tier.required)

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Certificates"
        subtitle="Download and share your donation certificates."
      />

      {/* Donation Progress */}
      <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-6 dark:border-red-900/30 dark:from-red-950/20 dark:to-red-900/10">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="rounded-full bg-red-600 p-4">
            <Heart className="h-8 w-8 fill-white text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-slate-100">
              Your Donation Progress
            </h3>
            {totalDonations === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">You haven't completed any donations yet.</p>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                You have completed <span className="font-semibold text-red-600 dark:text-red-400">{totalDonations} donation{totalDonations !== 1 && 's'}</span>
              </p>
            )}
            {unlockedTiers.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                {unlockedTiers.map(tier => (
                  <span key={tier.name} className={`rounded-full border px-2 py-1 text-xs font-medium border-${tier.color.split(' ')[0].split('-')[1]}-300 ${tier.color}`}>
                    <CheckCircle className="mr-1 inline h-3 w-3" /> {tier.name} Unlocked
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Certificates */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Achievement Certificates</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CERTIFICATE_TIERS.map(tier => {
            const isUnlocked = totalDonations >= tier.required
            const remaining = tier.required - totalDonations

            return isUnlocked ? (
              <div key={tier.name} className="rounded-xl border-2 border-green-200 bg-white p-6 transition-all hover:shadow-xl dark:border-green-900/50 dark:bg-slate-800">
                <div className="relative mb-4 flex items-center justify-center">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${tier.gradient}`}>
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="mb-4 text-center">
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-slate-100">{tier.name} Certificate</h3>
                  <p className="mb-2 text-sm text-gray-600 dark:text-slate-400">{tier.required} donation{tier.required !== 1 && 's'} milestone</p>
                  <span className="rounded-full border border-green-300 bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="mr-1 inline h-3 w-3" />Unlocked
                  </span>
                </div>
                <Button className="w-full bg-red-600 text-white hover:bg-red-700" onClick={() => window.open(`${API_BASE_URL}/donor/certificates/achievement.php?tier=${tier.name}&required=${tier.required}`, '_blank')}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            ) : (
              <div key={tier.name} className="rounded-xl border-2 border-gray-200 bg-white p-6 opacity-60 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-slate-600 dark:to-slate-700">
                    <Lock className="h-10 w-10 text-gray-500 dark:text-slate-400" />
                  </div>
                </div>
                <div className="mb-4 text-center">
                  <h3 className="mb-2 font-semibold text-gray-500 dark:text-slate-400">{tier.name} Certificate</h3>
                  <p className="mb-2 text-sm text-gray-500 dark:text-slate-400">Requires {tier.required} donations</p>
                  <span className="rounded-full border border-gray-400 px-2 py-1 text-xs font-medium text-gray-600 dark:border-slate-600 dark:text-slate-400">
                    {remaining} more donation{remaining !== 1 && 's'} needed
                  </span>
                </div>
                <Button variant="outline" className="w-full cursor-not-allowed" disabled>
                  <Lock className="h-4 w-4" /> Locked
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Donation Certificates */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6">
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-slate-100">Recent Donation Certificates</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">Download individual certificates for each donation</p>
        </div>
        
        {certs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certs.map((cert) => (
              <div
                key={cert.cert_id}
                className="flex h-full flex-col rounded-md border-t-4 border-red-600 bg-white p-5 shadow-sm dark:bg-slate-800 border-l border-r border-b"
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
                  <Button variant="primary" size="sm" fullWidth onClick={() => handleDownload(cert)}>
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
    </div>
  )
}
