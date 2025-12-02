import apiClient from './client'
import { LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '../types'

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  register: async (data: RegisterRequest): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  checkId: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.get('/auth/check-id', { params: { id } })
    return response.data
  },

  validatePassword: async (password: string, confirmPassword: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/validate-password', null, {
      params: { password, confirmPassword },
    })
    return response.data
  },
}

