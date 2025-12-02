import apiClient from './client'
import { Order, ApiResponse } from '../types'

export const deliveryApi = {
  getReadyOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/delivery/orders/ready')
    return response.data
  },

  getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/delivery/orders/my')
    return response.data
  },

  pickupOrder: async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post(`/delivery/orders/${orderId}/pickup`)
    return response.data
  },

  completeDelivery: async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post(`/delivery/orders/${orderId}/complete`)
    return response.data
  },
}

