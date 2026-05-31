import { useRef, useCallback, useEffect } from 'react'
import type { VideoSource } from '../types/video'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { Controls } from './Controls'

interface VideoPlayerProps {
  source: VideoSource | null
  onEnded?: () => void
}

export function VideoPlayer({ source, onEnded }: VideoPlayerProps) {
  const player = useVideoPlayer({
    autoplay: true,
    onEnded,
  })

  // 当 source 变化时加载新视频
  useEffect(() => {
    if (source) {
      player.setSource(source)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source])

  // 双击全屏
  const handleDoubleClick = useCallback(() => {
    player.toggleFullscreen()
  }, [player])

  // 单击播放/暂停（需防抖与双击冲突）
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    }
  }, [])

  const handleClick = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      return
    }
    clickTimerRef.current = setTimeout(() => {
      player.togglePlay()
      clickTimerRef.current = null
    }, 250)
  }, [player])

  return (
    <div
      ref={player.containerRef}
      className="relative w-full max-w-4xl mx-auto aspect-video bg-black rounded-xl overflow-hidden
                 group cursor-pointer"
      onMouseMove={player.resetHideTimer}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* 视频元素 */}
      <video
        ref={player.videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
      />

      {/* 中心播放按钮（暂停时显示） */}
      {!player.isPlaying && !player.isLoading && source && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-[#e94560]/80 rounded-full flex items-center justify-center
                          shadow-lg shadow-[#e94560]/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <polygon points="8,5 8,19 19,12"/>
            </svg>
          </div>
        </div>
      )}

      {/* 加载指示器 */}
      {player.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-3 border-[#e94560] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 控制栏 */}
      <Controls player={player} visible={player.showControls} />
    </div>
  )
}
