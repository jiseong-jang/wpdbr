import apiClient from './client'
import { CustomerProfile, UpdateProfileRequest, CustomerCoupon, ApiResponse } from '../types'

export const customerApi = {
  getProfile: async (): Promise<ApiResponse<CustomerProfile>> => {
    const response = await apiClient.get('/customer/profile')
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<CustomerProfile>> => {
    const response = await apiClient.put('/customer/profile', data)
    return response.data
  },

  deleteAccount: async (password: string): Promise<ApiResponse> => {
    const response = await apiClient.delete('/customer/account', {
      params: { password },
    })
    return response.data
  },

  getCoupons: async (): Promise<ApiResponse<CustomerCoupon[]>> => {
    const response = await apiClient.get('/customer/coupons')
    return response.data
  },
}

