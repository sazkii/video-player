import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { FileQuestion } from 'lucide-react'

// ============================================
// CinemaFlow EmptyState 空状态组件
// 统一处理各种"无数据"场景
// ============================================

export interface EmptyStateProps {
  /** 标题 */
  title: string
  /** 描述信息 */
  description?: string
  /** 图标 */
  icon?: React.ReactNode
  /** 操作按钮 */
  action?: React.ReactNode
  /** 自定义类名 */
  className?: string
}

function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-6">
        {icon ?? <FileQuestion className="h-8 w-8 text-text-muted" />}
      </div>
      <h3 className="mb-1 text-lg font-medium text-text-primary">{title}</h3>
      {description && (
        <p className="mb-4 text-sm text-text-secondary max-w-sm">
          {description}
        </p>
      )}
      {action}
    </motion.div>
  )
}

export { EmptyState }
