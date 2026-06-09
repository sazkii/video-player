import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { RotateCcw, RotateCw } from 'lucide-react'

// ============================================
// CinemaFlow SkipIcon 快退/快进图标组件
// 组合 Lucide 图标 + 数字叠加
// ============================================

interface SkipIconProps {
  direction: 'backward' | 'forward'
  seconds?: number
  className?: string
}

function SkipIcon({ direction, seconds = 10, className }: SkipIconProps) {
  const Icon = direction === 'backward' ? RotateCcw : RotateCw

  return (
    <motion.span
      className={cn('relative inline-flex items-center justify-center', className)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Icon className="h-[22px] w-[22px]" />
      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
        {seconds}
      </span>
    </motion.span>
  )
}

export { SkipIcon }
