import { create } from 'zustand'
import { User, UserRole, LoginRequest } from '../types'
import { authApi } from '../api/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  initialized: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    initialized: false,

    login: async (data: LoginRequest) => {
      try {
        const response = await authApi.login(data)
        if (response.success && response.data) {
          const { token, userId, role } = response.data
          set({
            user: { id: userId, role },
            token,
            isAuthenticated: true,
            initialized: true,
          })
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify({ id: userId, role }))
        } else {
          throw new Error(response.message || '로그인 실패')
        }
      } catch (error: any) {
        // API 에러 응답에서 메시지 추출
        const errorMessage = error?.response?.data?.message || error?.message || '로그인 실패'
        throw new Error(errorMessage)
      }
    },

    logout: async () => {
      try {
        await authApi.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          initialized: true,
        })
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    checkAuth: () => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          set({
            user,
            token,
            isAuthenticated: true,
            initialized: true,
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            initialized: true,
          })
        }
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          initialized: true,
        })
      }
    },
  })
)

