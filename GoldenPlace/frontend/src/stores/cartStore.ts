import { create } from 'zustand'

interface CartUIState {
  isOpen: boolean
  triggerRefresh: number
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  refreshCart: () => void
}

export const useCartStore = create<CartUIState>((set) => ({
  isOpen: false,
  triggerRefresh: 0,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  refreshCart: () => set((state) => ({ triggerRefresh: state.triggerRefresh + 1 })),
}))
