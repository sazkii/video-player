import type { Theme, DataSource } from '../../types/video'

interface DataSourceItemProps {
  source: DataSource
  isCustom?: boolean
  onPlay: (url: string) => void
  onEdit?: () => void
  onDelete?: () => void
  theme: Theme
}

export function DataSourceItem({
  source,
  isCustom = false,
  onPlay,
  onEdit,
  onDelete,
  theme,
}: DataSourceItemProps) {
  const isDark = theme === 'dark'

  const formatBadge =
    source.format === 'm3u8'
      ? isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'
      : source.format === 'mp4'
        ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
        : source.format === 'webm'
          ? isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-50 text-purple-600'
          : isDark ? 'bg-white/[0.06] text-white/40' : 'bg-gray-100 text-gray-500'

  return (
    <div className={`group flex items-start gap-3 p-3 rounded-xl transition-colors
      ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'}`}>
      {/* 播放按钮 */}
      <button
        onClick={() => onPlay(source.url)}
        className="flex-shrink-0 w-10 h-10 bg-[#e94560]/10 hover:bg-[#e94560]/20
                   rounded-xl flex items-center justify-center transition-colors mt-0.5"
        title={`播放 ${source.name}`}
      >
        <svg width="14" height="14" viewBox="0 0 100 100" fill="none">
          <polygon points="35,25 35,75 80,50" fill="#e94560" />
        </svg>
      </button>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className={`text-[13px] font-medium truncate
            ${isDark ? 'text-white/85' : 'text-gray-800'}`}>
            {source.name}
          </span>
          <span className={`flex-shrink-0 px-1.5 py-0.5 text-[9px] font-medium rounded ${formatBadge}`}>
            {source.format.toUpperCase()}
          </span>
          {source.resolution && (
            <span className={`flex-shrink-0 px-1.5 py-0.5 text-[9px] rounded
              ${isDark ? 'bg-white/[0.06] text-white/35' : 'bg-gray-100 text-gray-500'}`}>
              {source.resolution}
            </span>
          )}
          {isCustom && (
            <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] rounded bg-yellow-500/12 text-yellow-500">
              自定义
            </span>
          )}
        </div>
        {source.description && (
          <p className={`text-[11px] truncate ${isDark ? 'text-white/30' : 'text-gray-500'}`}>
            {source.description}
          </p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={onEdit}
            className={`w-7 h-7 flex items-center justify-center transition-colors rounded-lg
              ${isDark ? 'text-white/30 hover:text-white/70 hover:bg-white/[0.06]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
            title="编辑"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className={`w-7 h-7 flex items-center justify-center transition-colors rounded-lg
              ${isDark ? 'text-white/30 hover:text-red-400 hover:bg-white/[0.06]' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
            title="删除"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
