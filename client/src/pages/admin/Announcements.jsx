import { useState, useEffect } from 'react'
import { Trash2, Bell } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../utils/apiService'

const PRIORITY_TONE = {
  normal: 'info',
  high: 'warning',
  urgent: 'danger',
}

const STATUS_TONE = {
  published: 'success',
  scheduled: 'warning',
  draft: 'neutral',
  archived: 'neutral',
}

const PRIORITY_OPTIONS = ['normal', 'high', 'urgent']
const TARGET_OPTIONS = ['all', 'donors', 'hospitals', 'seekers']
const TARGET_LABELS = {
  all: 'All Users',
  donors: 'Donors Only',
  hospitals: 'Hospitals Only',
  seekers: 'Seekers Only',
}

export default function Announcements() {
  const { toast } = useToast()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('normal')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('all')
  const [schedule, setSchedule] = useState('')
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const data = await api.get('/admin/announcements.php')
      if (data.success) setList(data.announcements || [])
    } catch (err) {
      console.error('Failed to load announcements:', err)
      toast('Failed to load announcements', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast('Please add a title and message.', { type: 'error' })
      return
    }
    setPublishing(true)
    try {
      const data = await api.post('/admin/announcements.php', {
        title: title.trim(),
        message: message.trim(),
        priority,
        target_audience: target,
        scheduled_at: schedule || null,
      })
      if (data.success) {
        toast(
          `Announcement ${data.announcement?.status === 'scheduled' ? 'scheduled' : 'published'} successfully.`,
          { type: 'success', title: 'Done!' }
        )
        setTitle('')
        setMessage('')
        setSchedule('')
        setPriority('normal')
        setTarget('all')
        // Refresh
        fetchAnnouncements()
      } else {
        toast(data.message || 'Failed to publish.', { type: 'error' })
      }
    } catch (err) {
      toast(err?.message || 'Failed to publish.', { type: 'error' })
    } finally {
      setPublishing(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try {
      const data = await api.delete(`/admin/announcements.php?id=${id}`)
      if (data.success) {
        setList((prev) => prev.filter((a) => a.id !== id))
        toast('Announcement deleted.', { type: 'info' })
      } else {
        toast(data.message || 'Delete failed.', { type: 'error' })
      }
    } catch (err) {
      toast('Delete failed.', { type: 'error' })
    }
  }

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A'
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Broadcast urgent notices to donors, hospitals and seekers."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* LEFT: list */}
        <div className="space-y-4">
          {loading ? (
            <p className="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800">
              Loading announcements...
            </p>
          ) : list.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
              <Bell className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">No announcements yet.</p>
            </div>
          ) : (
            list.map((a) => (
              <div
                key={a.id}
                className={`rounded-md border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 ${
                  a.priority === 'urgent' ? 'border-l-2 border-l-red-600' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={PRIORITY_TONE[a.priority] || 'info'} size="sm" className="capitalize">
                        {a.priority}
                      </Badge>
                      <Badge variant="neutral" size="sm" className="capitalize">
                        {TARGET_LABELS[a.target_audience] || a.target_audience}
                      </Badge>
                    </div>
                    <h3 className="mt-2 font-semibold text-gray-900 dark:text-slate-100">
                      {a.title}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{formatDate(a.created_at)}</p>
                  </div>
                  <Badge variant={STATUS_TONE[a.status] || 'neutral'} size="sm" dot className="capitalize shrink-0">
                    {a.status}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-slate-400">
                  {a.message}
                </p>
                <div className="mt-3 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT: form */}
        <form
          onSubmit={handlePublish}
          className="h-fit rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Create Announcement
          </h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Urgent B+ needed in Sylhet"
            />
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Message
              </label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement..."
                className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <Select
              label="Target Audience"
              options={TARGET_OPTIONS}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <Input
              label="Schedule Date (optional – leave blank to publish now)"
              type="datetime-local"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
            <Button type="submit" fullWidth loading={publishing}>
              {schedule ? 'Schedule' : 'Publish Now'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
