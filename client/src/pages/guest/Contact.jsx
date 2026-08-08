import { useState } from 'react'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  MessageCircle,
  Share2,
  Send,
  CheckCircle,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { api } from '../../utils/apiService'
import { useToast } from '../../components/ui/Toast'

const INFO = [
  { icon: MapPin, title: 'Visit Us', value: 'House 42, Road 11, Banani, Dhaka 1213' },
  { icon: Phone, title: 'Call Us', value: '+880 1700-000000' },
  { icon: Mail, title: 'Email Us', value: 'info@bloodconnect.org' },
  { icon: Clock, title: 'Response Time', value: 'Within 24 hours' },
]

const SUBJECTS = ['General Inquiry', 'Partnership', 'Report Issue', 'Emergency', 'Other']

const SOCIALS = [Globe, MessageCircle, Share2]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact() {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email'
    if (!form.subject) next.subject = 'Please choose a subject'
    if (!form.message.trim()) next.message = 'Message is required'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    setIsLoading(true)
    
    try {
      const res = await api.post('/guest/contact.php', form)
      if (res.success) {
        setSent(true)
      } else {
        toast(res.message || 'Failed to send message', { type: 'error' })
      }
    } catch (err) {
      console.error(err)
      toast('An error occurred. Please try again later.', { type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-slate-300">
          Questions, partnerships or emergencies — reach the BloodConnect team any time.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
        {/* LEFT: contact info */}
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {INFO.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-md border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex size-10 items-center justify-center rounded-md bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{item.value}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-300">
              Connect with us
            </p>
            <div className="flex gap-3">
              {SOCIALS.map((Icon, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label="Social link"
                  className="flex size-10 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition-colors hover:border-red-600 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400 dark:hover:text-red-400"
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: form */}
        <div className="rounded-md border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle className="h-14 w-14 text-green-600 dark:text-green-400" />
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-slate-100">
                Message Sent
              </h3>
              <p className="mt-2 max-w-xs text-sm text-gray-600 dark:text-slate-300">
                Thank you! We'll respond within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-slate-100">
                Send us a message
              </h3>
              <div className="space-y-4">
                <Input
                  label="Name"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={update('name')}
                  error={errors.name}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  leftIcon={Mail}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update('email')}
                  error={errors.email}
                  required
                />
                <Select
                  label="Subject"
                  name="subject"
                  placeholder="Select a subject"
                  options={SUBJECTS}
                  value={form.subject}
                  onChange={update('subject')}
                  error={errors.subject}
                />
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-gray-700 dark:text-slate-300"
                  >
                    Message
                    <span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={update('message')}
                    className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                  {errors.message && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {errors.message}
                    </span>
                  )}
                </div>
                <Button type="submit" variant="primary" fullWidth loading={isLoading}>
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
