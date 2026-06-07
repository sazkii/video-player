import { useRef, useCallback, useEffect } from 'react'
import type { Theme, VideoSource } from '../types/video'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { Controls } from './Controls'

interface VideoPlayerProps {
  source: VideoSource | null
  onEnded?: () => void
  theme: Theme
}

export function VideoPlayer({ source, onEnded, theme }: VideoPlayerProps) {
  const player = useVideoPlayer({
    autoplay: true,
    onEnded,
  })

  const isDark = theme === 'dark'

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
      className={`relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer
        ${isDark ? 'bg-black' : 'bg-gray-900 shadow-lg shadow-black/5'}`}
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

      {/* 无源时的占位 */}
      {!source && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center
          ${isDark ? 'bg-white/[0.03]' : 'bg-gray-900'}`}>
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <p className="text-white/20 text-sm">点击"数据源"选择视频开始播放</p>
        </div>
      )}

      {/* 中心播放按钮（暂停时显示） */}
      {!player.isPlaying && !player.isLoading && source && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-[#e94560]/80 rounded-full flex items-center justify-center
                          shadow-lg shadow-[#e94560]/30 backdrop-blur-sm">
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

      {/* 错误提示 */}
      {player.error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm
                        text-white px-4 py-2 rounded-lg text-sm shadow-lg pointer-events-none">
          {player.error}
        </div>
      )}

      {/* 控制栏 */}
      <Controls player={player} visible={player.showControls} />
    </div>
  )
}
