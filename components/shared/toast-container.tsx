'use client'

import * as React from 'react'
import { Toaster, toast } from 'sonner'

export function ToastProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                richColors
                closeButton
                expand={false}
                duration={4000}
            />
        </>
    )
}

export function Toast({
    title,
    description,
    variant = 'default',
}: {
    title?: string
    description?: string
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
}) {
    React.useEffect(() => {
        if (variant === 'success') {
            toast.success(title, { description })
        } else if (variant === 'error') {
            toast.error(title, { description })
        } else if (variant === 'warning') {
            toast.warning(title, { description })
        } else if (variant === 'info') {
            toast.info(title, { description })
        } else {
            toast(title, { description })
        }
    }, [title, description, variant])

    return null
}

export function useToast() {
    return {
        toast: (options: {
            title?: string
            description?: string
            variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
        }) => {
            const { title, description, variant = 'default' } = options
            if (variant === 'success') {
                toast.success(title, { description })
            } else if (variant === 'error') {
                toast.error(title, { description })
            } else if (variant === 'warning') {
                toast.warning(title, { description })
            } else if (variant === 'info') {
                toast.info(title, { description })
            } else {
                toast(title, { description })
            }
        },
        success: (message: string, description?: string) => {
            toast.success(message, { description })
        },
        error: (message: string, description?: string) => {
            toast.error(message, { description })
        },
        warning: (message: string, description?: string) => {
            toast.warning(message, { description })
        },
        info: (message: string, description?: string) => {
            toast.info(message, { description })
        },
        dismiss: (toastId?: string) => {
            toast.dismiss(toastId)
        },
    }
}
