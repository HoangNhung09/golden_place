import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserResponse } from '../types'

interface AuthState {
  user: UserResponse | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (user: UserResponse, accessToken: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: Partial<UserResponse>) => void
  setAccessToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
      setAccessToken: (accessToken) =>
        set({ accessToken }),
    }),
    {
      name: 'auth-storage', // matches localStorage key in axios.ts
    }
  )
)
