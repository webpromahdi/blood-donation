import { Link } from 'react-router-dom'
import { Droplet, Home } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-slate-950">
      <Droplet className="h-12 w-12 text-red-600" fill="currentColor" />
      <p className="mt-6 text-6xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold text-gray-800 dark:text-slate-200">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-gray-500 dark:text-slate-400">
        The page you're looking for doesn't exist or has been moved. Let's get you
        back to saving lives.
      </p>
      <Button as={Link} to="/" size="lg" className="mt-8">
        <Home className="h-4 w-4" /> Back to home
      </Button>
    </div>
  )
}
