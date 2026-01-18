'use client'

import { ToastProvider } from '@/components/shared/toast-container'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
