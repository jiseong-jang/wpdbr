import apiClient from './client'
import { Menu, Item, ApiResponse } from '../types'

export const menuApi = {
  getAllMenus: async (): Promise<ApiResponse<Menu[]>> => {
    const response = await apiClient.get('/menus')
    return response.data
  },

  getMenuById: async (id: number): Promise<ApiResponse<Menu>> => {
    const response = await apiClient.get(`/menus/${id}`)
    return response.data
  },

  getAllItems: async (): Promise<ApiResponse<Item[]>> => {
    const response = await apiClient.get('/items')
    return response.data
  },

  getItemById: async (id: number): Promise<ApiResponse<Item>> => {
    const response = await apiClient.get(`/items/${id}`)
    return response.data
  },
}

