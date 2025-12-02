import apiClient from './client'
import { Order, Inventory, Coupon, CreateCouponRequest, ApiResponse } from '../types'

export const kitchenApi = {
  getPendingOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/kitchen/orders/pending')
    return response.data
  },

  getReservationOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/kitchen/orders/reservations')
    return response.data
  },

  getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/kitchen/orders/my')
    return response.data
  },

  receiveOrder: async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post(`/kitchen/orders/${orderId}/receive`)
    return response.data
  },

  startCooking: async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post(`/kitchen/orders/${orderId}/start`)
    return response.data
  },

  completeCooking: async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post(`/kitchen/orders/${orderId}/complete`)
    return response.data
  },

  rejectOrder: async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post(`/kitchen/orders/${orderId}/reject`)
    return response.data
  },

  getInventory: async (): Promise<ApiResponse<Inventory[]>> => {
    const response = await apiClient.get('/kitchen/inventory')
    return response.data
  },

  updateStock: async (itemCode: string, amount: number, action: string): Promise<ApiResponse<Inventory>> => {
    const response = await apiClient.put(`/kitchen/inventory/${itemCode}`, null, {
      params: { amount, action },
    })
    return response.data
  },

  requestRestock: async (itemCode: string): Promise<ApiResponse> => {
    const response = await apiClient.post(`/kitchen/inventory/${itemCode}/restock-request`)
    return response.data
  },

  createCoupon: async (data: CreateCouponRequest): Promise<ApiResponse<Coupon>> => {
    const response = await apiClient.post('/kitchen/coupons', data)
    return response.data
  },

  getCoupons: async (): Promise<ApiResponse<Coupon[]>> => {
    const response = await apiClient.get('/kitchen/coupons')
    return response.data
  },

  toggleCoupon: async (id: number): Promise<ApiResponse<Coupon>> => {
    const response = await apiClient.post(`/kitchen/coupons/${id}/toggle`)
    return response.data
  },

  deleteCoupon: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/kitchen/coupons/${id}`)
    return response.data
  },
}

