import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/apiService'

export const AuthContext = createContext(null)

const REDIRECT = {
  donor: '/donor/dashboard',
  admin: '/admin/dashboard',
  hospital: '/hospital/dashboard',
  seeker: '/seeker/request',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while checking session on mount

  // On app mount — verify session is still valid
  useEffect(() => {
    const saved = localStorage.getItem('bc_user')
    if (!saved) {
      setLoading(false)
      return
    }
    api
      .get('/auth/check.php')
      .then((data) => {
        if (data.success) {
          setUser(JSON.parse(saved))
        } else {
          localStorage.removeItem('bc_user')
          setUser(null)
        }
      })
      .catch(() => {
        localStorage.removeItem('bc_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  /**
   * Login — calls PHP session endpoint
   * Returns the full API response so caller can handle errors/redirects
   */
  const login = async (email, password, role) => {
    const data = await api.post('/auth/login.php', { email, password, role })
    if (data.success) {
      setUser(data.user)
      localStorage.setItem('bc_user', JSON.stringify(data.user))
    }
    return data
  }

  /**
   * Logout — destroys PHP session + clears local state
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout.php', {})
    } catch (_) {
      // ignore logout errors — clear local state regardless
    }
    setUser(null)
    localStorage.removeItem('bc_user')
  }

  const redirectForRole = (role) => REDIRECT[role] || '/login'

  const setSessionUser = (userData) => {
    setUser(userData)
    localStorage.setItem('bc_user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, logout, redirectForRole, setSessionUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
