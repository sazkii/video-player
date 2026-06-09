import type { Theme, VideoSource } from '../types/video'

interface PlaylistProps {
  theme: Theme
  videos: VideoSource[]
  currentIndex: number
  onSelect: (index: number) => void
  onRemove: (index: number) => void
}

export function Playlist({ theme, videos, currentIndex, onSelect, onRemove }: PlaylistProps) {
  if (videos.length <= 1) return null
  const isDark = theme === 'dark'

  // 从 URL 推断格式
  const getFormat = (url: string): string => {
    const lower = typeof url === 'string' ? url.toLowerCase() : ''
    if (lower.includes('.m3u8')) return 'm3u8'
    if (lower.includes('.mp4')) return 'mp4'
    if (lower.includes('.webm')) return 'webm'
    return ''
  }

  const getFormatColor = (fmt: string): string => {
    if (fmt === 'm3u8') return 'bg-blue-500/15 text-blue-400'
    if (fmt === 'mp4') return 'bg-emerald-500/15 text-emerald-400'
    if (fmt === 'webm') return 'bg-purple-500/15 text-purple-400'
    return 'bg-white/[0.06] text-white/40'
  }

  return (
    <section className="mt-10">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <h3 className={`text-[13px] font-semibold ${isDark ? 'text-white/80' : 'text-gray-800'}`}>
            播放列表
          </h3>
          <span className={`text-[11px] px-2 py-0.5 rounded-full
            ${isDark ? 'bg-white/[0.06] text-white/35' : 'bg-gray-100 text-gray-400'}`}>
            {videos.length}
          </span>
        </div>
      </div>

      {/* 横向滚动卡片 */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory
                      scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {videos.map((video, index) => {
          const fmt = getFormat(typeof video.src === 'string' ? video.src : '')
          const isActive = index === currentIndex

          return (
            <div
              key={video.id}
              onClick={() => onSelect(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(index) }}
              className={`group snap-start flex-shrink-0 w-56 rounded-xl overflow-hidden text-left transition-all duration-200 cursor-pointer
                ${isActive
                  ? isDark
                    ? 'ring-2 ring-[#ff0000]/50 bg-white/[0.07]'
                    : 'ring-2 ring-[#ff0000]/40 bg-white shadow-sm'
                  : isDark
                    ? 'bg-white/[0.04] hover:bg-white/[0.08] hover:shadow-lg hover:shadow-black/20'
                    : 'bg-gray-50 hover:bg-gray-100 shadow-sm hover:shadow'
                }`}
            >
              {/* 缩略图占位 */}
              <div className={`relative w-full aspect-video flex items-center justify-center
                ${isActive
                  ? isDark ? 'bg-[#ff0000]/10' : 'bg-[#ff0000]/5'
                  : isDark ? 'bg-white/[0.03]' : 'bg-gray-100'
                }`}>
                {isActive ? (
                  <div className="w-9 h-9 bg-[#ff0000]/80 rounded-full flex items-center justify-center
                                  shadow-lg shadow-[#ff0000]/20">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <polygon points="8,5 8,19 19,12" />
                    </svg>
                  </div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke={isDark ? 'rgba(255,255,255,0.12)' : '#d1d5db'} strokeWidth="1.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}

                {/* 格式标签 */}
                {fmt && (
                  <span className={`absolute top-2 left-2 text-[9px] font-medium px-1.5 py-0.5 rounded
                    ${getFormatColor(fmt)}`}>
                    {fmt.toUpperCase()}
                  </span>
                )}

                {/* 删除按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(index)
                  }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center
                    text-[10px] opacity-0 group-hover:opacity-100 transition-opacity
                    bg-black/60 text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* 信息 */}
              <div className="px-3 py-2.5">
                <p className={`text-[12px] font-medium truncate
                  ${isActive
                    ? isDark ? 'text-white' : 'text-gray-900'
                    : isDark ? 'text-white/65' : 'text-gray-600'
                  }`}>
                  {video.name}
                </p>
                <p className={`text-[10px] mt-0.5
                  ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
                  {video.type === 'file' ? '本地文件' : '在线视频'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
