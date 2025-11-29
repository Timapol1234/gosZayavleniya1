'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const toastConfig = {
  success: {
    icon: 'check_circle',
    className: 'bg-success/10 text-success border-success/20',
    iconClassName: 'text-success',
  },
  error: {
    icon: 'error',
    className: 'bg-error/10 text-error border-error/20',
    iconClassName: 'text-error',
  },
  warning: {
    icon: 'warning',
    className: 'bg-warning/10 text-warning border-warning/20',
    iconClassName: 'text-warning',
  },
  info: {
    icon: 'info',
    className: 'bg-info/10 text-info border-info/20',
    iconClassName: 'text-info',
  },
}

export function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const config = toastConfig[type]

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-right',
        config.className
      )}
      role="alert"
    >
      <span className={cn('material-symbols-outlined', config.iconClassName)}>
        {config.icon}
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-current opacity-70 transition-opacity hover:opacity-100"
        aria-label="Закрыть"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>
    </div>
  )
}
