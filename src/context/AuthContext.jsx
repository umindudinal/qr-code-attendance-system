import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError, getJson, postJson } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'auth_token'

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const loadProfile = useCallback(async () => {
    if (!token) {
      setUser(null)
      return
    }
    setStatus('loading')
    try {
      const profile = await getJson('/api/auth/me')
      setUser(profile.user)
      setError(null)
    } catch (err) {
      setUser(null)
      if (err instanceof ApiError) {
        setError(err.message)
      }
      localStorage.removeItem(STORAGE_KEY)
      setToken(null)
    } finally {
      setStatus('ready')
    }
  }, [token])

  useEffect(() => {
    if (token) {
      loadProfile()
    }
  }, [token, loadProfile])

  const login = async (email, password) => {
    const data = await postJson('/api/auth/login', { email, password })
    localStorage.setItem(STORAGE_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    setError(null)
  }

  const register = async (payload) => {
    const data = await postJson('/api/auth/register', payload)
    localStorage.setItem(STORAGE_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    setError(null)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      status,
      error,
      login,
      register,
      logout,
      reload: loadProfile,
    }),
    [token, user, status, error, loadProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
