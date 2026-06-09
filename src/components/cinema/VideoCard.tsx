import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { staggerItem } from '@/lib/animations'
import { Play } from 'lucide-react'

// ============================================
// CinemaFlow VideoCard 视频卡片组件
// 统一的视频缩略图卡片，用于搜索结果、推荐、收藏
// ============================================

export interface VideoCardProps {
  /** 视频标题 */
  title: string
  /** 缩略图 URL */
  poster?: string
  /** 站点名称 */
  siteName?: string
  /** 额外信息（年份、类型等） */
  meta?: string
  /** 附加标签（如格式标签） */
  badge?: React.ReactNode
  /** 点击回调 */
  onClick?: () => void
  /** 自定义类名 */
  className?: string
}

function VideoCard({
  title,
  poster,
  siteName,
  meta,
  badge,
  onClick,
  className,
}: VideoCardProps) {
  /** 从标题提取首字母作为海报占位符 */
  const initial = title?.charAt(0) ?? '?'

  return (
    <motion.button
      variants={staggerItem}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn('group text-left w-full', className)}
      onClick={onClick}
    >
      {/* 缩略图 */}
      <div className="aspect-video bg-surface-4 rounded-xl overflow-hidden relative">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-6 to-surface-4 flex items-center justify-center">
            <span className="text-4xl font-bold text-text-dim select-none">
              {initial}
            </span>
          </div>
        )}
        {/* 悬浮播放指示器 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="h-12 w-12 rounded-full bg-accent/80 flex items-center justify-center shadow-lg">
            <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
        {/* 标签 */}
        {badge && (
          <div className="absolute top-2 right-2">
            {badge}
          </div>
        )}
      </div>

      {/* 文字信息 */}
      <div className="flex gap-3 mt-3">
        {siteName && (
          <div className="w-9 h-9 rounded-full bg-brand-purple shrink-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {siteName.charAt(0)}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug">
            {title}
          </h3>
          {meta && (
            <p className="text-xs text-text-secondary mt-1">{meta}</p>
          )}
        </div>
      </div>
    </motion.button>
  )
}

export { VideoCard }
