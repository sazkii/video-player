import { useRef, useEffect } from 'react'
import '@vidstack/react/player/styles/default/theme.css'
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  isHLSProvider,
  type MediaPlayerInstance,
} from '@vidstack/react'
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default'
import { buildProxyUrl } from '@/lib/api'

export interface VidstackPlayerProps {
  /** 视频 URL（m3u8 或 mp4） */
  src: string
  /** Referer（用于代理） */
  referer?: string
  /** 封面图 */
  poster?: string
  /** 播放结束回调 */
  onEnded?: () => void
  /** 播放开始回调 */
  onPlay?: () => void
  /** 暂停回调 */
  onPause?: () => void
}

/**
 * 基于 Vidstack 的视频播放器
 * 内置 HLS 支持、代理请求、默认控制栏、手势操作
 */
export function VidstackPlayer({
  src,
  referer,
  poster,
  onEnded,
  onPlay,
  onPause,
}: VidstackPlayerProps) {
  const player = useRef<MediaPlayerInstance>(null)

  // 通过代理 URL 加载视频
  const proxySrc = buildProxyUrl(src, referer)
  const type = src.includes('.m3u8') ? 'application/x-mpegurl' : 'video/mp4'

  // 外部控制同步
  useEffect(() => {
    const el = player.current
    if (!el) return
    const playHandler = () => onPlay?.()
    const pauseHandler = () => onPause?.()
    const endedHandler = () => onEnded?.()
    el.addEventListener('play', playHandler)
    el.addEventListener('pause', pauseHandler)
    el.addEventListener('ended', endedHandler)
    return () => {
      el.removeEventListener('play', playHandler)
      el.removeEventListener('pause', pauseHandler)
      el.removeEventListener('ended', endedHandler)
    }
  }, [onPlay, onPause, onEnded])

  return (
    <MediaPlayer
      ref={player}
      src={{ src: proxySrc, type }}
      crossOrigin
      playsInline
      onProviderChange={(provider) => {
        if (isHLSProvider(provider)) {
          // 配置 HLS 性能参数
          provider.config = {
            maxBufferSize: 30_000_000,
            maxMaxBufferLength: 60,
            startFragPrefetch: true,
            manifestLoadPolicy: {
              default: {
                maxLoadTimeMs: 8000,
                maxTimeToFirstByteMs: 8000,
                timeoutRetry: { maxNumRetry: 2, retryDelayMs: 2000, maxRetryDelayMs: 4000 },
                errorRetry: { maxNumRetry: 2, retryDelayMs: 2000, maxRetryDelayMs: 4000 },
              },
            },
            fragLoadPolicy: {
              default: {
                maxLoadTimeMs: 8000,
                maxTimeToFirstByteMs: 8000,
                timeoutRetry: { maxNumRetry: 2, retryDelayMs: 2000, maxRetryDelayMs: 4000 },
                errorRetry: { maxNumRetry: 2, retryDelayMs: 2000, maxRetryDelayMs: 4000 },
              },
            },
          }
        }
      }}
    >
      <MediaProvider>
        {poster && <Poster className="vds-poster" src={poster} />}
      </MediaProvider>
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  )
}
