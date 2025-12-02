import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { UserRole } from '../types'

interface RoleRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user } = useAuthStore()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default RoleRoute

