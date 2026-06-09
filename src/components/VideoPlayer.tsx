import { useRef, useCallback, useEffect, useMemo } from 'react'
import type { Theme, VideoSource } from '../types/video'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { Controls } from './Controls'

/** 从 URL 中提取 YouTube 视频 ID */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?.*?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m?.[1]) return m[1]
  }
  return null
}

/** 从 URL 中提取 Bilibili BV 号 */
function extractBilibiliId(url: string): string | null {
  const patterns = [
    /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/i,
    /b23\.tv\/(BV[a-zA-Z0-9]+)/i,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m?.[1]) return m[1]
  }
  return null
}

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

  const youtubeId = useMemo(() => {
    if (!source || source.type === 'file') return null
    return extractYouTubeId(typeof source.src === 'string' ? source.src : '')
  }, [source])

  const bilibiliId = useMemo(() => {
    if (!source || source.type === 'file') return null
    return extractBilibiliId(typeof source.src === 'string' ? source.src : '')
  }, [source])

  // 当 source 变化时加载新视频（YouTube/Bilibili 由 iframe 处理，跳过）
  useEffect(() => {
    if (source && !youtubeId && !bilibiliId) {
      player.setSource(source)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, youtubeId, bilibiliId])

  // 单击播放/暂停 + 双击全屏（防抖）
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

  const handleDoubleClick = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }
    player.toggleFullscreen()
  }, [player])

  return (
    <div
      ref={player.containerRef}
      className={`relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer
        transition-shadow duration-300
        ${isDark
          ? 'bg-[#111] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.5)]'
          : 'bg-gray-900 shadow-lg shadow-black/10'
        }`}
      onMouseMove={player.resetHideTimer}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* 嵌入播放器（YouTube / Bilibili） */}
      {youtubeId ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={source?.name ?? 'YouTube video'}
        />
      ) : bilibiliId ? (
        <iframe
          src={`https://player.bilibili.com/player.html?bvid=${bilibiliId}&autoplay=1&high_quality=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"
          title={source?.name ?? 'Bilibili video'}
        />
      ) : (
        <>
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
          ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-900'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4
            ${isDark ? 'bg-white/[0.04]' : 'bg-white/10'}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.25)'}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <p className={`text-sm mb-1 ${isDark ? 'text-white/25' : 'text-white/50'}`}>
            选择数据源开始播放
          </p>
          <p className={`text-xs ${isDark ? 'text-white/10' : 'text-white/30'}`}>
            支持 MP4 / WebM / HLS / YouTube / Bilibili
          </p>
        </div>
      )}

      {/* 中心播放按钮（暂停时显示） */}
      {!player.isPlaying && !player.isLoading && source && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 bg-[#ff0000]/85 rounded-full flex items-center justify-center
                          shadow-lg shadow-black/40 backdrop-blur-sm
                          transition-transform group-hover:scale-105">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="8,5 8,19 19,12" />
            </svg>
          </div>
        </div>
      )}

      {/* 加载指示器 */}
      {player.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-[2.5px] border-[#ff0000]/60 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 错误提示 */}
      {player.error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm
                        text-white px-4 py-2 rounded-full text-xs shadow-lg pointer-events-none font-medium">
          {player.error}
        </div>
      )}

      {/* 控制栏：有源时才显示（YouTube/Bilibili 使用自带控制） */}
      {source && !youtubeId && !bilibiliId && <Controls player={player} visible={player.showControls} />}
        </>
      )}
    </div>
  )
}
