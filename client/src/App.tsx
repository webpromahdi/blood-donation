import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Droplet } from 'lucide-react'
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Guest
const Home = lazy(() => import('./pages/guest/Home'))
const About = lazy(() => import('./pages/guest/About'))
const Contact = lazy(() => import('./pages/guest/Contact'))
const Blog = lazy(() => import('./pages/guest/Blog'))
const BlogPost = lazy(() => import('./pages/guest/BlogPost'))
const Donors = lazy(() => import('./pages/guest/Donors'))
const DonorProfile = lazy(() => import('./pages/guest/DonorProfile'))
const FAQ = lazy(() => import('./pages/guest/FAQ'))
const Eligibility = lazy(() => import('./pages/guest/Eligibility'))
const WhyDonate = lazy(() => import('./pages/guest/WhyDonate'))
const TrackRequest = lazy(() => import('./pages/guest/TrackRequest'))

// Auth
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))

// Donor
const DonorDashboard = lazy(() => import('./pages/donor/Dashboard'))
const DonorHealth = lazy(() => import('./pages/donor/Health'))
const DonorVoluntary = lazy(() => import('./pages/donor/Voluntary'))
const DonorHistory = lazy(() => import('./pages/donor/History'))
const DonorCertificates = lazy(() => import('./pages/donor/Certificates'))
const DonorChat = lazy(() => import('./pages/donor/Chat'))
const DonorNotifications = lazy(() => import('./pages/donor/Notifications'))
const DonorProfilePage = lazy(() => import('./pages/donor/Profile'))

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminDonors = lazy(() => import('./pages/admin/Donors'))
const AdminHospitals = lazy(() => import('./pages/admin/Hospitals'))
const AdminVoluntary = lazy(() => import('./pages/admin/Voluntary'))
const AdminBloodGroups = lazy(() => import('./pages/admin/BloodGroups'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'))
const AdminChat = lazy(() => import('./pages/admin/Chat'))
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'))
const AdminProfile = lazy(() => import('./pages/admin/Profile'))

// Hospital
const HospitalDashboard = lazy(() => import('./pages/hospital/Dashboard'))
const HospitalDonors = lazy(() => import('./pages/hospital/Donors'))
const HospitalAppointments = lazy(() => import('./pages/hospital/Appointments'))
const HospitalRequests = lazy(() => import('./pages/hospital/Requests'))
const HospitalChat = lazy(() => import('./pages/hospital/Chat'))
const HospitalNotifications = lazy(() => import('./pages/hospital/Notifications'))
const HospitalProfile = lazy(() => import('./pages/hospital/Profile'))

// Seeker
const SeekerRequest = lazy(() => import('./pages/seeker/Request'))
const SeekerRequestDetails = lazy(() => import('./pages/seeker/RequestDetails'))
const SeekerTracking = lazy(() => import('./pages/seeker/Tracking'))
const SeekerChat = lazy(() => import('./pages/seeker/Chat'))
const SeekerNotifications = lazy(() => import('./pages/seeker/Notifications'))
const SeekerProfile = lazy(() => import('./pages/seeker/Profile'))

const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <Droplet className="heart-pulse h-10 w-10 text-red-600" fill="currentColor" />
        <span className="text-sm font-medium text-gray-400 dark:text-slate-500">
          Loading…
        </span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/donors" element={<Donors />} />
          <Route path="/donors/:id" element={<DonorProfile />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/eligibility" element={<Eligibility />} />
          <Route path="/why-donate" element={<WhyDonate />} />
          <Route path="/track-request" element={<TrackRequest />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Donor — protected */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DashboardLayout role="donor" />
            </ProtectedRoute>
          }
        >
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/health" element={<DonorHealth />} />
          <Route path="/donor/voluntary" element={<DonorVoluntary />} />
          <Route path="/donor/history" element={<DonorHistory />} />
          <Route path="/donor/certificates" element={<DonorCertificates />} />
          <Route path="/donor/chat" element={<DonorChat />} />
          <Route path="/donor/notifications" element={<DonorNotifications />} />
          <Route path="/donor/profile" element={<DonorProfilePage />} />
        </Route>

        {/* Admin — protected */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/donors" element={<AdminDonors />} />
          <Route path="/admin/hospitals" element={<AdminHospitals />} />
          <Route path="/admin/voluntary" element={<AdminVoluntary />} />
          <Route path="/admin/blood-groups" element={<AdminBloodGroups />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/chat" element={<AdminChat />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>

        {/* Hospital — protected */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['hospital']}>
              <DashboardLayout role="hospital" />
            </ProtectedRoute>
          }
        >
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/hospital/donors" element={<HospitalDonors />} />
          <Route path="/hospital/appointments" element={<HospitalAppointments />} />
          <Route path="/hospital/requests" element={<HospitalRequests />} />
          <Route path="/hospital/chat" element={<HospitalChat />} />
          <Route path="/hospital/notifications" element={<HospitalNotifications />} />
          <Route path="/hospital/profile" element={<HospitalProfile />} />
        </Route>

        {/* Seeker — protected */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <DashboardLayout role="seeker" />
            </ProtectedRoute>
          }
        >
          <Route path="/seeker/request" element={<SeekerRequest />} />
          <Route path="/seeker/request/:id" element={<SeekerRequestDetails />} />
          <Route path="/seeker/tracking" element={<SeekerTracking />} />
          <Route path="/seeker/chat" element={<SeekerChat />} />
          <Route path="/seeker/notifications" element={<SeekerNotifications />} />
          <Route path="/seeker/profile" element={<SeekerProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
