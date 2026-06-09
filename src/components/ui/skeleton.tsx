import { cn } from '@/lib/utils'

// ============================================
// CinemaFlow Skeleton 骨架屏组件
// ============================================

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-surface-6',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
