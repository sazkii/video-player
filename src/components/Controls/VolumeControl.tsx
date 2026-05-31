import { useRef, useCallback, useEffect } from 'react'

interface VolumeControlProps {
  volume: number
  isMuted: boolean
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
}

/** 音量图标组件（提取到外部避免每次渲染重建） */
function VolumeIcon({ isMuted, volume }: { isMuted: boolean; volume: number }) {
  if (isMuted || volume === 0) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      </svg>
    )
  }
  if (volume < 0.5) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  )
}

export function VolumeControl({ volume, isMuted, onVolumeChange, onToggleMute }: VolumeControlProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const getVolumeFromPosition = useCallback((clientX: number) => {
    const slider = sliderRef.current
    if (!slider) return 0
    const rect = slider.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    onVolumeChange(getVolumeFromPosition(e.clientX))

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        onVolumeChange(getVolumeFromPosition(e.clientX))
      }
    }
    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [getVolumeFromPosition, onVolumeChange])

  // 组件卸载时清理 document 事件监听
  useEffect(() => {
    return () => {
      isDraggingRef.current = false
    }
  }, [])

  const displayVolume = isMuted ? 0 : volume

  return (
    <div className="flex items-center gap-1 group/vol">
      <button
        onClick={onToggleMute}
        className="w-8 h-8 flex items-center justify-center hover:text-[#e94560] transition-colors"
        title={isMuted ? '取消静音 (M)' : '静音 (M)'}
      >
        <VolumeIcon isMuted={isMuted} volume={volume} />
      </button>
      <div
        ref={sliderRef}
        className="w-0 group-hover/vol:w-20 transition-all duration-200 overflow-hidden cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <div className="w-20 h-1 bg-white/20 rounded-full relative mx-1">
          <div
            className="absolute h-full bg-[#e94560] rounded-full"
            style={{ width: `${displayVolume * 100}%` }}
          />
          <div
            className="absolute w-3 h-3 bg-white rounded-full -translate-y-1/2 -translate-x-1/2 top-1/2"
            style={{ left: `${displayVolume * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
