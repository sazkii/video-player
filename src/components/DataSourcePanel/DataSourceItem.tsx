import type { DataSource } from '../../types/video'

interface DataSourceItemProps {
  source: DataSource
  isCustom?: boolean
  onPlay: (url: string) => void
  onEdit?: () => void
  onDelete?: () => void
}

/**
 * 单个数据源卡片
 * 显示名称、描述、格式标签，提供播放/编辑/删除操作
 */
export function DataSourceItem({
  source,
  isCustom = false,
  onPlay,
  onEdit,
  onDelete,
}: DataSourceItemProps) {
  // 格式标签颜色
  const formatColor =
    source.format === 'm3u8'
      ? 'bg-blue-500/20 text-blue-400'
      : source.format === 'mp4'
        ? 'bg-green-500/20 text-green-400'
        : source.format === 'webm'
          ? 'bg-purple-500/20 text-purple-400'
          : 'bg-gray-500/20 text-gray-400'

  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
      {/* 播放图标 */}
      <button
        onClick={() => onPlay(source.url)}
        className="flex-shrink-0 w-10 h-10 bg-[#e94560]/20 hover:bg-[#e94560]/30
                   rounded-lg flex items-center justify-center transition-colors mt-0.5"
        title={`播放 ${source.name}`}
      >
        <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
          <polygon points="35,25 35,75 80,50" fill="#e94560" />
        </svg>
      </button>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white/90 text-sm font-medium truncate">{source.name}</span>
          <span className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] rounded ${formatColor}`}>
            {source.format.toUpperCase()}
          </span>
          {source.resolution && (
            <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-white/50">
              {source.resolution}
            </span>
          )}
          {isCustom && (
            <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] rounded bg-yellow-500/20 text-yellow-400">
              自定义
            </span>
          )}
        </div>
        {source.description && (
          <p className="text-white/40 text-xs truncate">{source.description}</p>
        )}
        <p className="text-white/20 text-[10px] truncate mt-1">{source.url}</p>
      </div>

      {/* 操作按钮 */}
      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 text-white/40 hover:text-white/70 transition-colors"
            title="编辑"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
            title="删除"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
