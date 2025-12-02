import { create } from 'zustand'
import { Menu } from '../types'
import { menuApi } from '../api/menu'

interface MenuState {
  menus: Menu[]
  selectedMenu: Menu | null
  loading: boolean
  error: string | null
  fetchMenus: () => Promise<void>
  selectMenu: (menu: Menu) => void
  getMenuById: (id: number) => Promise<void>
}

export const useMenuStore = create<MenuState>((set) => ({
  menus: [],
  selectedMenu: null,
  loading: false,
  error: null,

  fetchMenus: async () => {
    set({ loading: true, error: null })
    try {
      const response = await menuApi.getAllMenus()
      if (response.success && response.data) {
        set({ menus: response.data, loading: false })
      } else {
        throw new Error(response.message || '메뉴 조회 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '메뉴 조회 실패', loading: false })
    }
  },

  selectMenu: (menu: Menu) => {
    set({ selectedMenu: menu })
  },

  getMenuById: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await menuApi.getMenuById(id)
      if (response.success && response.data) {
        set({ selectedMenu: response.data, loading: false })
      } else {
        throw new Error(response.message || '메뉴 조회 실패')
      }
    } catch (error: any) {
      set({ error: error.message || '메뉴 조회 실패', loading: false })
    }
  },
}))

