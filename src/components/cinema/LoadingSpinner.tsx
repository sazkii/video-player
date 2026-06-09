import { cn } from '@/lib/utils'

// ============================================
// CinemaFlow LoadingSpinner 统一加载动画
// 替换分散在各处的重复 spinner 代码
// ============================================

interface LoadingSpinnerProps {
  /** 尺寸：sm(16px) | md(24px) | lg(32px) */
  size?: 'sm' | 'md' | 'lg'
  /** 自定义类名 */
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-accent/60 border-t-transparent',
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  )
}

export { LoadingSpinner }
