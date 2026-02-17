const API_BASE = import.meta.env.VITE_API_URL || ''

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const getToken = () => localStorage.getItem('auth_token')

export const apiRequest = async (path, options = {}) => {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = payload?.message || 'Request failed'
    throw new ApiError(message, response.status, payload)
  }

  return payload
}

export const getJson = (path) => apiRequest(path)

export const postJson = (path, body) =>
  apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const patchJson = (path, body) =>
  apiRequest(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
