import { ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, initialized, checkAuth } = useAuthStore()

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // 아직 초기화 안 됐으면 로딩 표시
  if (!initialized) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

