import apiClient from './client'
import { Cart, AddCartItemRequest, CartItem, ApiResponse } from '../types'

export const cartApi = {
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await apiClient.get('/cart')
    return response.data
  },

  addItem: async (data: AddCartItemRequest): Promise<ApiResponse<CartItem>> => {
    const response = await apiClient.post('/cart/items', data)
    return response.data
  },

  updateItem: async (id: number, quantity: number): Promise<ApiResponse<CartItem>> => {
    const response = await apiClient.put(`/cart/items/${id}`, null, {
      params: { quantity },
    })
    return response.data
  },

  removeItem: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/cart/items/${id}`)
    return response.data
  },

  clearCart: async (): Promise<ApiResponse> => {
    const response = await apiClient.delete('/cart')
    return response.data
  },
}

