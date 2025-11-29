'use client'

import { cn } from '@/lib/utils'

type SaveStatus = 'saved' | 'saving' | 'error'

interface SaveIndicatorProps {
  status: SaveStatus
  className?: string
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {status === 'saving' && (
        <>
          <span className="material-symbols-outlined animate-spin text-base text-gray-500">
            progress_activity
          </span>
          <span className="text-gray-600">Сохранение...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <span className="material-symbols-outlined text-base text-green-600">
            check_circle
          </span>
          <span className="text-green-600">Сохранено</span>
        </>
      )}

      {status === 'error' && (
        <>
          <span className="material-symbols-outlined text-base text-red-600">
            error
          </span>
          <span className="text-red-600">Ошибка сохранения</span>
        </>
      )}
    </div>
  )
}
