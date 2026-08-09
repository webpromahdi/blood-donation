/**
 * Central API Service
 * All fetch calls go through here. Automatically:
 *   - Sends session cookies (credentials: 'include')
 *   - Sets Content-Type header
 *   - Throws structured errors on non-OK responses
 */

const BASE = `${import.meta.env.VITE_API_BASE}/api`
export const API_BASE_URL = `${import.meta.env.VITE_API_BASE}/api`

interface ApiError {
  status: number
  success: false
  message: string
  [key: string]: unknown
}

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    credentials: 'include',   // Send PHP session cookie with every request
    headers: {
      'Content-Type': 'application/json',
    },
    ...opts,
  })

  const data = await res.json()

  if (!res.ok) {
    if (res.status === 401 && !url.includes('login') && !url.includes('register')) {
      window.location.href = '/login'
    }
    const error: ApiError = { status: res.status, success: false, message: 'Request failed', ...data }
    throw error
  }

  return data as T
}

export const api = {
  /** GET request */
  get: <T = unknown>(url: string) =>
    req<T>(url),

  /** POST request with JSON body */
  post: <T = unknown>(url: string, body: object) =>
    req<T>(url, { method: 'POST', body: JSON.stringify(body) }),

  /** PUT request with JSON body */
  put: <T = unknown>(url: string, body: object) =>
    req<T>(url, { method: 'PUT', body: JSON.stringify(body) }),

  /** DELETE request */
  delete: <T = unknown>(url: string) =>
    req<T>(url, { method: 'DELETE' }),

  /** DELETE request with JSON body */
  deleteWithBody: <T = unknown>(url: string, body: object) =>
    req<T>(url, { method: 'DELETE', body: JSON.stringify(body) }),
}

export default api
