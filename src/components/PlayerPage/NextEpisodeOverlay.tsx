import { useState, useEffect } from 'react'

interface Props {
  nextEpisodeName: string
  onPlay: () => void
  onCancel: () => void
}

const COUNTDOWN_SECONDS = 5

export default function NextEpisodeOverlay({ nextEpisodeName, onPlay, onCancel }: Props) {
  const [count, setCount] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    if (count <= 0) {
      onPlay()
      return
    }
    const timer = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [count, onPlay])

  const progress = ((COUNTDOWN_SECONDS - count) / COUNTDOWN_SECONDS) * 100
  const circumference = 2 * Math.PI * 38

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
      <div className="bg-[#1a1a1a] rounded-2xl p-6 flex flex-col items-center gap-4 max-w-xs">
        <p className="text-white/70 text-sm text-center">
          即将播放下一集
        </p>
        <p className="text-white font-medium text-center truncate w-full">
          {nextEpisodeName}
        </p>

        {/* 圆形倒计时 */}
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              cx="40" cy="40" r="38" fill="none"
              stroke="#ff0000" strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xl font-bold">{count}</span>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onPlay}
            className="flex-1 py-2 rounded-xl bg-[#ff0000] text-white text-sm font-medium hover:bg-[#ff0000]/80 transition-colors"
          >
            立即播放
          </button>
        </div>
      </div>
    </div>
  )
}
