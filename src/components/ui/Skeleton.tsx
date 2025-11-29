import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export default function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-label="Загрузка..."
    />
  )
}

// Предустановленные варианты для частых случаев
export function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-6">
      <Skeleton variant="text" height={24} width="60%" />
      <Skeleton variant="text" height={16} width="40%" />
      <div className="space-y-2">
        <Skeleton variant="text" height={14} width="100%" />
        <Skeleton variant="text" height={14} width="90%" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangular" height={36} width={120} />
        <Skeleton variant="rectangular" height={36} width={80} />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  )
}
