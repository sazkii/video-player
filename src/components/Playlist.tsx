import type { VideoSource } from '../types/video'

interface PlaylistProps {
  videos: VideoSource[]
  currentIndex: number
  onSelect: (index: number) => void
  onRemove: (index: number) => void
}

export function Playlist({ videos, currentIndex, onSelect, onRemove }: PlaylistProps) {
  if (videos.length <= 1) return null

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">播放列表</h3>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {videos.map((video, index) => (
          <div
            key={video.id}
            onClick={() => onSelect(index)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
              ${index === currentIndex
                ? 'bg-[#e94560]/20 border border-[#e94560]/30'
                : 'hover:bg-white/5'
              }`}
          >
            <span className="text-white/30 text-xs w-6 text-center">
              {index === currentIndex ? '▶' : index + 1}
            </span>
            <span className="text-white/80 text-sm truncate flex-1">
              {video.name}
            </span>
            <span className="text-white/30 text-xs">
              {video.type === 'file' ? '本地' : '在线'}
            </span>
            {videos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(index)
                }}
                className="text-white/20 hover:text-red-400 text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
