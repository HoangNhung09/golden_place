import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function AdminRoute() {
  const { user, isAuthenticated } = useAuthStore()

  const isAdmin = isAuthenticated && user?.role === 'admin'

  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />
}
