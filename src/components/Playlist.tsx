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

  return (
    <section>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${isDark ? 'text-white/85' : 'text-gray-800'}`}>
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
        {videos.map((video, index) => (
          <button
            key={video.id}
            onClick={() => onSelect(index)}
            className={`snap-start flex-shrink-0 w-52 rounded-xl overflow-hidden text-left transition-all
              ${index === currentIndex
                ? isDark
                  ? 'ring-2 ring-[#e94560]/60 bg-white/[0.06]'
                  : 'ring-2 ring-[#e94560]/40 bg-white shadow-sm'
                : isDark
                  ? 'bg-white/[0.04] hover:bg-white/[0.07]'
                  : 'bg-gray-50 hover:bg-gray-100 shadow-sm'
              }`}
          >
            {/* 缩略图占位 */}
            <div className={`relative w-full aspect-video flex items-center justify-center
              ${index === currentIndex
                ? isDark ? 'bg-[#e94560]/10' : 'bg-[#e94560]/5'
                : isDark ? 'bg-white/[0.03]' : 'bg-gray-100'
              }`}>
              {index === currentIndex ? (
                <div className="w-8 h-8 bg-[#e94560]/80 rounded-full flex items-center justify-center">
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

              {/* 删除按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(index)
                }}
                className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center
                  text-[10px] opacity-0 group-hover:opacity-100 transition-opacity
                  ${isDark
                    ? 'bg-black/60 text-white/60 hover:text-white'
                    : 'bg-black/40 text-white/70 hover:text-white'
                  }`}
              >
                ✕
              </button>
            </div>

            {/* 信息 */}
            <div className="px-3 py-2.5">
              <p className={`text-xs font-medium truncate
                ${index === currentIndex
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
          </button>
        ))}
      </div>
    </section>
  )
}
