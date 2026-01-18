'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { INotification } from '@/types'

type Theme = 'simple' | 'modern' | 'tech' | 'nerdy'

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  notifications: INotification[]
  unreadCount: number
  isLoading: boolean
}

interface UIActions {
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  setNotifications: (notifications: INotification[]) => void
  addNotification: (notification: INotification) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      theme: 'modern',
      sidebarOpen: true,
      mobileMenuOpen: false,
      notifications: [],
      unreadCount: 0,
      isLoading: false,

      setTheme: (theme) => {
        set({ theme })
        // Apply theme to document root
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme)
        }
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.read).length
        set({ notifications, unreadCount })
      },

      addNotification: (notification) => {
        const { notifications } = get()
        const unreadCount = notifications.filter(n => !n.read).length + (notification.read ? 0 : 1)
        set({
          notifications: [notification, ...notifications],
          unreadCount
        })
      },

      markNotificationRead: (id) => {
        const { notifications } = get()
        const updated = notifications.map(n =>
          n._id === id ? { ...n, read: true } : n
        )
        const unreadCount = updated.filter(n => !n.read).length
        set({ notifications: updated, unreadCount })
      },

      markAllNotificationsRead: () => {
        const { notifications } = get()
        const updated = notifications.map(n => ({ ...n, read: true }))
        set({ notifications: updated, unreadCount: 0 })
      },

      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'exam-ready-ui',
      partialize: (state) => ({ theme: state.theme })
    }
  )
)
