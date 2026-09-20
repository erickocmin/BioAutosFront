import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../components/feedback/States'
import { useAuth } from '../auth/AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <main className="center-page"><LoadingState /></main>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}
