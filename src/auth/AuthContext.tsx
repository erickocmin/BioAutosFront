/* eslint-disable react/only-export-components, react/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { SessionUser } from '../types/api'

interface AuthValue {
  user: SessionUser | null
  loading: boolean
  login: (usuario: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(() => Boolean(sessionStorage.getItem('sisgetran.access')))

  const loadUser = useCallback(async () => {
    try {
      const { data } = await api.get<SessionUser>('/accounts/auth/me/')
      setUser(data)
    } catch {
      sessionStorage.removeItem('sisgetran.access')
      localStorage.removeItem('sisgetran.refresh')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem('sisgetran.access')) void loadUser()
  }, [loadUser])

  useEffect(() => {
    const expired = () => { setUser(null); setLoading(false) }
    window.addEventListener('sisgetran:session-expired', expired)
    return () => window.removeEventListener('sisgetran:session-expired', expired)
  }, [])

  const login = async (usuario: string, password: string) => {
    const { data } = await api.post('/accounts/auth/login/', { usuario, password })
    sessionStorage.setItem('sisgetran.access', data.access)
    localStorage.setItem('sisgetran.refresh', data.refresh)
    setUser(data.usuario)
  }

  const logout = async () => {
    const refresh = localStorage.getItem('sisgetran.refresh')
    try { if (refresh) await api.post('/accounts/auth/logout/', { refresh }) } finally {
      sessionStorage.removeItem('sisgetran.access')
      localStorage.removeItem('sisgetran.refresh')
      setUser(null)
    }
  }

  const value = useMemo<AuthValue>(() => ({
    user, loading, login, logout,
    hasPermission: (permission) => Boolean(user?.permissions.includes('*') || user?.permissions.includes(permission)),
  }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
