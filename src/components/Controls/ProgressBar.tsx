import { useRef, useState, useCallback, useEffect } from 'react'
import { formatTime } from '../../utils/formatTime'

interface ProgressBarProps {
  currentTime: number
  duration: number
  buffered: number
  onSeek: (time: number) => void
}

export function ProgressBar({ currentTime, duration, buffered, onSeek }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverX, setHoverX] = useState(0)
  const onSeekRef = useRef(onSeek)
  onSeekRef.current = onSeek
  const isDraggingRef = useRef(false)

  const getTimeFromPosition = useCallback((clientX: number) => {
    const bar = barRef.current
    if (!bar || !duration) return 0
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return ratio * duration
  }, [duration])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    const time = getTimeFromPosition(e.clientX)
    onSeekRef.current(time)

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const time = getTimeFromPosition(e.clientX)
        onSeekRef.current(time)
      }
    }
    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [getTimeFromPosition])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const time = getTimeFromPosition(e.clientX)
    const rect = barRef.current?.getBoundingClientRect()
    if (rect) {
      setHoverX(e.clientX - rect.left)
    }
    setHoverTime(time)
  }, [getTimeFromPosition])

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null)
  }, [])

  useEffect(() => {
    return () => {
      isDraggingRef.current = false
    }
  }, [])

  if (!duration) return null

  const progress = (currentTime / duration) * 100
  const bufferProgress = buffered * 100

  return (
    <div
      ref={barRef}
      className="relative w-full h-5 flex items-center cursor-pointer group/prog"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 进度条轨道 */}
      <div className="w-full h-[3px] bg-white/15 rounded-full group-hover/prog:h-[5px] transition-all relative">
        {/* 缓冲区 */}
        <div
          className="absolute h-full bg-white/20 rounded-full"
          style={{ width: `${bufferProgress}%` }}
        />
        {/* 播放进度 */}
        <div
          className="absolute h-full bg-[#ff0000] rounded-full transition-none"
          style={{ width: `${progress}%` }}
        />
        {/* 拖拽手柄 */}
        <div
          className="absolute w-3.5 h-3.5 bg-white rounded-full -translate-x-1/2 top-1/2 -translate-y-1/2
                     opacity-0 group-hover/prog:opacity-100 transition-opacity shadow-md shadow-black/30"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Hover 时间提示 */}
      {hoverTime !== null && (
        <div
          className="absolute -top-7 px-2 py-0.5 bg-[#1a1a1a] text-white text-[11px] rounded-md
                     pointer-events-none -translate-x-1/2 whitespace-nowrap font-mono shadow-lg"
          style={{ left: hoverX }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  )
}
