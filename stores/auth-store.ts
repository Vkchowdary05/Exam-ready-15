'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IUser, ILoginCredentials, IRegisterData } from '@/types'
import { authApi, setAuthToken } from '@/lib/api'

interface AuthState {
  user: IUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: ILoginCredentials) => Promise<boolean>
  register: (data: IRegisterData) => Promise<boolean>
  logout: () => void
  setUser: (user: IUser | null) => void
  setError: (error: string | null) => void
  clearError: () => void
  checkAuth: () => Promise<void>
  updateProfile: (updates: Partial<IUser>) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        
        const response = await authApi.login(credentials)
        
        if (response.success && response.data) {
          setAuthToken(response.data.token)
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return true
        } else {
          set({
            error: response.error || 'Login failed',
            isLoading: false
          })
          return false
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        
        const response = await authApi.register(data)
        
        if (response.success && response.data) {
          setAuthToken(response.data.token)
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return true
        } else {
          set({
            error: response.error || 'Registration failed',
            isLoading: false
          })
          return false
        }
      },

      logout: () => {
        setAuthToken(null)
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      setUser: (user) => set({ user }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ isAuthenticated: false })
          return
        }

        set({ isLoading: true })
        const response = await authApi.getMe()
        
        if (response.success && response.data) {
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false
          })
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
          setAuthToken(null)
        }
      },

      updateProfile: (updates) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      }
    }),
    {
      name: 'exam-ready-auth',
      partialize: (state) => ({ token: state.token })
    }
  )
)
