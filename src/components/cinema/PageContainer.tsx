import { cn } from '@/lib/utils'

// ============================================
// CinemaFlow PageContainer 页面容器
// 统一页面级布局和间距
// ============================================

interface PageContainerProps {
  children: React.ReactNode
  /** 是否使用紧凑内边距 */
  compact?: boolean
  className?: string
}

function PageContainer({
  children,
  compact = false,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-background text-text-primary',
        compact ? 'px-4 py-4' : 'px-4 md:px-10 py-8',
        className
      )}
    >
      {children}
    </div>
  )
}

export { PageContainer }
