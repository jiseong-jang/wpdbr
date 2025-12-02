import { create } from 'zustand'
import { Inventory } from '../types'
import { kitchenApi } from '../api/kitchen'

interface InventoryState {
  inventory: Inventory[]
  loading: boolean
  error: string | null
  fetchInventory: () => Promise<void>
  updateStock: (itemCode: string, amount: number, action: string) => Promise<void>
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: [],
  loading: false,
  error: null,

  fetchInventory: async () => {
    set({ loading: true, error: null })
    try {
      const response = await kitchenApi.getInventory()
      if (response.success && response.data) {
        set({ inventory: response.data, loading: false })
      } else {
        throw new Error(response.message || '재고 조회 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '재고 조회 실패', loading: false })
    }
  },

  updateStock: async (itemCode: string, amount: number, action: string) => {
    set({ loading: true, error: null })
    try {
      const response = await kitchenApi.updateStock(itemCode, amount, action)
      if (response.success) {
        await get().fetchInventory()
      } else {
        throw new Error(response.message || '재고 수정 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '재고 수정 실패', loading: false })
      throw error
    }
  },
}))

