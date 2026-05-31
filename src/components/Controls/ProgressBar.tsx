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

  // 清理拖拽状态（组件卸载时）
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
      className="relative w-full h-6 flex items-center cursor-pointer group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 进度条轨道 */}
      <div className="w-full h-1 bg-white/20 rounded-full group-hover:h-1.5 transition-all relative">
        {/* 缓冲区 */}
        <div
          className="absolute h-full bg-white/30 rounded-full"
          style={{ width: `${bufferProgress}%` }}
        />
        {/* 播放进度 */}
        <div
          className="absolute h-full bg-[#e94560] rounded-full"
          style={{ width: `${progress}%` }}
        />
        {/* 拖拽手柄 */}
        <div
          className="absolute w-3 h-3 bg-[#e94560] rounded-full -translate-x-1/2
                     opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Hover 时间提示 */}
      {hoverTime !== null && (
        <div
          className="absolute -top-8 px-2 py-1 bg-black/90 text-white text-xs rounded
                     pointer-events-none -translate-x-1/2 whitespace-nowrap"
          style={{ left: hoverX }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  )
}
