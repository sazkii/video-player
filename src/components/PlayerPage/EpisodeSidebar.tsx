import { useState, useEffect, useCallback } from 'react'
import type { Episode } from '../../types/api.js'

interface Props {
  episodes: Episode[]
  currentIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}

export default function EpisodeSidebar({ episodes, currentIndex, onSelect, onClose }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleSelect = useCallback((i: number) => {
    onSelect(i)
    if (isMobile) onClose()
  }, [onSelect, isMobile, onClose])

  // 移动端底部弹出
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60" />
        <div
          className="relative w-full max-h-[60vh] bg-[#141414] rounded-t-2xl overflow-hidden
                     animate-[slideUp_0.25s_ease-out]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white/60 text-sm">剧集列表 ({episodes.length}集)</span>
            <button onClick={onClose} className="text-white/40 hover:text-white text-sm">关闭</button>
          </div>
          <div className="overflow-y-auto max-h-[calc(60vh-50px)] p-3 grid grid-cols-5 gap-2">
            {episodes.map((ep, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`rounded-lg py-2.5 px-1 text-xs text-center truncate transition-colors
                  ${i === currentIndex
                    ? 'bg-[#ff0000] text-white'
                    : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.12]'
                  }`}
              >
                {ep.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 桌面端右侧 320px 面板
  return (
    <div className="w-80 flex-shrink-0 bg-[#111] border-l border-white/10 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white/60 text-sm">剧集列表 ({episodes.length}集)</span>
        <button onClick={onClose} className="text-white/40 hover:text-white text-sm">✕</button>
      </div>
      <div className="overflow-y-auto flex-1 p-3 grid grid-cols-3 gap-2">
        {episodes.map((ep, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`rounded-lg py-2.5 px-1 text-xs text-center truncate transition-colors
              ${i === currentIndex
                ? 'bg-[#ff0000] text-white'
                : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.12]'
              }`}
          >
            {ep.name}
          </button>
        ))}
      </div>
    </div>
  )
}
