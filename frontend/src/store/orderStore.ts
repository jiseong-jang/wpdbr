import { create } from 'zustand'
import { Order, CreateOrderRequest, UpdateOrderRequest } from '../types'
import { orderApi } from '../api/order'

interface OrderState {
  orders: Order[]
  reservationOrders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  fetchReservationOrders: () => Promise<void>
  createOrder: (data: CreateOrderRequest) => Promise<Order>
  trackOrder: (id: number) => Promise<void>
  getCurrentOrder: () => Promise<void>
  cancelOrder: (id: number) => Promise<Order>
  updateOrder: (id: number, data: UpdateOrderRequest) => Promise<Order>
  applyCoupon: (orderId: number, couponCode?: string, customerCouponId?: number) => Promise<Order>
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  reservationOrders: [],
  currentOrder: null,
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null })
    try {
      const response = await orderApi.getOrderHistory()
      if (response.success && response.data) {
        set({ orders: response.data, loading: false })
      } else {
        throw new Error(response.message || '주문 내역 조회 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '주문 내역 조회 실패', loading: false })
    }
  },

  fetchReservationOrders: async () => {
    set({ loading: true, error: null })
    try {
      const response = await orderApi.getReservationOrders()
      if (response.success && response.data) {
        set({ reservationOrders: response.data, loading: false })
      } else {
        throw new Error(response.message || '예약 주문 조회 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '예약 주문 조회 실패', loading: false })
    }
  },

  createOrder: async (data: CreateOrderRequest) => {
    set({ loading: true, error: null })
    try {
      const response = await orderApi.createOrder(data)
      if (response.success && response.data) {
        set({ currentOrder: response.data, loading: false })
        return response.data
      } else {
        throw new Error(response.message || '주문 생성 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '주문 생성 실패', loading: false })
      throw error
    }
  },

  trackOrder: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await orderApi.getOrderById(id)
      if (response.success && response.data) {
        set({ currentOrder: response.data, loading: false })
      } else {
        throw new Error(response.message || '주문 조회 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '주문 조회 실패', loading: false })
    }
  },

  getCurrentOrder: async () => {
    set({ loading: true, error: null })
    try {
      const response = await orderApi.getCurrentOrder()
      if (response.success && response.data) {
        set({ currentOrder: response.data, loading: false })
      } else {
        set({ currentOrder: null, loading: false })
      }
    } catch (error: any) {
      set({ currentOrder: null, loading: false })
    }
  },

  cancelOrder: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await orderApi.cancelOrder(id)
      if (response.success && response.data) {
        const updated = response.data
        set((state) => ({
          currentOrder: updated,
          orders: state.orders.map((o) => (o.orderId === updated.orderId ? updated : o)),
          loading: false,
        }))
        return updated
      } else {
        throw new Error(response.message || '주문 취소 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '주문 취소 실패', loading: false })
      throw error
    }
  },

  updateOrder: async (id: number, data: UpdateOrderRequest) => {
    set({ loading: true, error: null })
    try {
      const response = await orderApi.updateOrder(id, data)
      if (response.success && response.data) {
        const updated = response.data
        set((state) => ({
          currentOrder: updated,
          orders: state.orders.map((o) => (o.orderId === updated.orderId ? updated : o)),
          loading: false,
        }))
        return updated
      } else {
        throw new Error(response.message || '주문 수정 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '주문 수정 실패', loading: false })
      throw error
    }
  },

  applyCoupon: async (orderId: number, couponCode?: string, customerCouponId?: number) => {
    set({ loading: true, error: null })
    try {
      const response = await orderApi.applyCoupon(orderId, couponCode, customerCouponId)
      if (response.success && response.data) {
        const updated = response.data
        set((state) => ({
          currentOrder: updated,
          orders: state.orders.map((o) => (o.orderId === updated.orderId ? updated : o)),
          loading: false,
        }))
        return updated
      } else {
        throw new Error(response.message || '쿠폰 적용 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '쿠폰 적용 실패', loading: false })
      throw error
    }
  },
}))

