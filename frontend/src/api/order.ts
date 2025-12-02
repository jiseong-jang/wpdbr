import apiClient from './client'
import { Order, CreateOrderRequest, UpdateOrderRequest, ApiResponse, Coupon } from '../types'

export const orderApi = {
  createOrder: async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post('/orders', data)
    return response.data
  },

  applyCoupon: async (orderId: number, couponCode?: string, customerCouponId?: number): Promise<ApiResponse<Order>> => {
    const params: any = {}
    if (customerCouponId) {
      params.customerCouponId = customerCouponId
    } else if (couponCode) {
      params.couponCode = couponCode
    }
    const response = await apiClient.post(`/orders/${orderId}/coupon`, null, { params })
    return response.data
  },

  getOrderHistory: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/orders')
    return response.data
  },

  getOrderById: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },

  getCurrentOrder: async (): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get('/orders/current')
    return response.data
  },

  cancelOrder: async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post(`/orders/${orderId}/cancel`)
    return response.data
  },

  getReservationOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/orders/reservations')
    return response.data
  },

  updateOrder: async (orderId: number, data: UpdateOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put(`/orders/${orderId}`, data)
    return response.data
  },

  getCouponByCode: async (code: string): Promise<ApiResponse<Coupon>> => {
    const response = await apiClient.get(`/orders/coupons/${code}`)
    return response.data
  },

  getModificationLogs: async (orderId: number): Promise<ApiResponse<import('../types').OrderModificationLog[]>> => {
    const response = await apiClient.get(`/orders/${orderId}/modification-logs`)
    return response.data
  },
}

