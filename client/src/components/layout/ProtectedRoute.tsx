import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Droplet } from 'lucide-react'

interface ProtectedRouteProps {
  allowedRoles?: string[]
  children: React.ReactNode
}

/**
 * Wraps protected routes.
 * - Shows loader while session is being verified on mount
 * - Redirects to /login if not authenticated
 * - Redirects to /login if role not allowed
 */
export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // Still checking session (first load)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Droplet className="heart-pulse h-10 w-10 text-red-600" fill="currentColor" />
          <span className="text-sm font-medium text-gray-400 dark:text-slate-500">
            Checking session…
          </span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Authenticated but wrong role — send to their own dashboard
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return <>{children}</>
}
