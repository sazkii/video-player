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
    <div className={`w-full max-w-4xl mx-auto px-6 py-4 rounded-2xl
      ${isDark ? 'bg-white/[0.02]' : 'bg-white shadow-sm border border-gray-100'}`}
    >
      <div className={`flex items-center gap-2 mb-3 px-1 ${isDark ? '' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke={isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af'} strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        <h3 className={`text-xs uppercase tracking-wider font-semibold
          ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          播放列表
        </h3>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-auto
          ${isDark ? 'bg-white/10 text-white/30' : 'bg-gray-100 text-gray-400'}`}>
          {videos.length} 个视频
        </span>
      </div>
      <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
        {videos.map((video, index) => (
          <div
            key={video.id}
            onClick={() => onSelect(index)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
              ${index === currentIndex
                ? isDark
                  ? 'bg-[#e94560]/15 border border-[#e94560]/20'
                  : 'bg-[#e94560]/5 border border-[#e94560]/20'
                : isDark
                  ? 'hover:bg-white/5 border border-transparent'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
          >
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0
              ${index === currentIndex
                ? 'bg-[#e94560] text-white'
                : isDark ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-400'
              }`}>
              {index === currentIndex ? '▶' : index + 1}
            </span>
            <span className={`text-sm truncate flex-1
              ${index === currentIndex
                ? isDark ? 'text-white' : 'text-gray-900'
                : isDark ? 'text-white/70' : 'text-gray-600'
              }`}>
              {video.name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0
              ${video.type === 'file'
                ? isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-500'
                : isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}>
              {video.type === 'file' ? '本地' : '在线'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(index)
              }}
              className={`w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 transition-colors
                ${isDark
                  ? 'text-white/20 hover:text-red-400 hover:bg-white/5'
                  : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                }`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
