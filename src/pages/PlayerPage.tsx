import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Hls from 'hls.js'
import { getPlaySources, getAllPlaySources, getDetail, buildProxyUrl, updateHistory } from '../services/api'
import type { PlaySource, Episode } from '../types/api.js'
import EpisodeSidebar from '../components/PlayerPage/EpisodeSidebar'
import NextEpisodeOverlay from '../components/PlayerPage/NextEpisodeOverlay'
import { ProgressBar } from '../components/PlayerPage/ProgressBar'
import { useProgressDrag } from '../hooks/useProgressDrag'
import { useGestureControls } from '../hooks/useGestureControls'

interface LocationState {
  detailUrl: string
  episodeUrl: string
  episodeName: string
  episodeIndex: number
  episodes: Episode[]
  siteId: string
  title?: string
  poster?: string
}

interface BackupSource {
  siteId: string
  siteName: string
  url: string
  referer: string
  sourceGroup?: string
}

export default function PlayerPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [_sources, setSources] = useState<PlaySource[]>([])
  const [currentSource, setCurrentSource] = useState<PlaySource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showControls, setShowControls] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const [showEpisodeSidebar, setShowEpisodeSidebar] = useState(false)
  const [volumeOverlay, setVolumeOverlay] = useState<{ value: number; side: 'left' | 'right' } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [buffered, setBuffered] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)

  const [backupSources, setBackupSources] = useState<BackupSource[]>([])
  const [backupLoading, setBackupLoading] = useState(true)
  const [activeSourceName, setActiveSourceName] = useState('')
  const [seekOverlay, setSeekOverlay] = useState<{ text: string; side: 'left' | 'right' } | null>(null)
  const [availableGroups, setAvailableGroups] = useState<string[]>([])
  const [currentGroup, setCurrentGroup] = useState('')

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const volumeOverlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seekOverlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const backupSourcesRef = useRef<BackupSource[]>([])
  const backupIndexRef = useRef(0)
  const backupsFetchedRef = useRef(false) // 跟踪 getAllPlaySources 是否已完成
  const tryingBackupRef = useRef(false)
  const preloadedSourcesRef = useRef<PlaySource[]>([])
  const currentRefererRef = useRef(state?.detailUrl ?? '')
  const siteId = state?.siteId ?? ''
  const episodes = state?.episodes ?? []
  const [currentEpIndex, setCurrentEpIndex] = useState(state?.episodeIndex ?? 0)

  // 检测移动端
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const loadEpisode = useCallback(async (epIndex: number) => {
    const ep = episodes[epIndex]
    if (!ep) return
    setCurrentEpIndex(epIndex)
    setLoading(true)
    setError('')
    setShowNextEpisode(false)
    tryingBackupRef.current = false
    backupIndexRef.current = 0
    backupsFetchedRef.current = false
    setBackupSources([])
    setBackupLoading(true)
    setActiveSourceName('')

    // 检查是否有预加载的播放源（下一集加速）
    const cached = preloadedSourcesRef.current
    if (cached.length > 0 && epIndex === currentEpIndex + 1) {
      preloadedSourcesRef.current = []
      setSources(cached)
      setCurrentSource(cached[0]!)
      setActiveSourceName(siteId)
    }

    try {
      // 获取详情以提取所有源组
      const detailRes = await getDetail(state?.detailUrl ?? '', siteId)
      if (detailRes.success && detailRes.detail.sourceGroups) {
        const groups = Object.keys(detailRes.detail.sourceGroups)
        setAvailableGroups(groups)
        const groupToUse = currentGroup && groups.includes(currentGroup) ? currentGroup : (groups[0] ?? '')
        setCurrentGroup(groupToUse)
        const res = await getPlaySources(state?.detailUrl ?? '', siteId, ep.url, groupToUse || undefined)
        if (res.success && res.sources.length > 0) {
          setSources(res.sources)
          setCurrentSource(res.sources[0]!)
          setActiveSourceName(groupToUse || siteId)
        } else if (backupSourcesRef.current.length > 0) {
          const first = backupSourcesRef.current[0]!
          backupIndexRef.current = 1
          currentRefererRef.current = first.referer
          setActiveSourceName(first.siteName)
          setCurrentSource({ url: first.url, format: 'm3u8', quality: first.siteName, needProxy: true })
        } else {
          setError('未找到可用的播放源')
        }
      } else {
        setAvailableGroups([])
        setCurrentGroup('')
        const res = await getPlaySources(state?.detailUrl ?? '', siteId, ep.url)
        if (res.success && res.sources.length > 0) {
          setSources(res.sources)
          setCurrentSource(res.sources[0]!)
          setActiveSourceName(siteId)
        } else if (backupSourcesRef.current.length > 0) {
          const first = backupSourcesRef.current[0]!
          backupIndexRef.current = 1
          currentRefererRef.current = first.referer
          setActiveSourceName(first.siteName)
          setCurrentSource({ url: first.url, format: 'm3u8', quality: first.siteName, needProxy: true })
        } else {
          setError('未找到可用的播放源')
        }
      }
    } catch {
      if (backupSourcesRef.current.length > 0) {
        const first = backupSourcesRef.current[0]!
        backupIndexRef.current = 1
        currentRefererRef.current = first.referer
        setActiveSourceName(first.siteName)
        setCurrentSource({ url: first.url, format: 'm3u8', quality: first.siteName, needProxy: true })
      } else {
        setError('获取播放源失败')
      }
    } finally {
      setLoading(false)
    }

    getAllPlaySources(state?.detailUrl ?? '', ep.url, siteId, epIndex)
      .then(r => {
        if (r.success) {
          const REFERER_MAP: Record<string, string> = {
            guangsuapi: 'https://api.guangsuapi.com/',
            sdzyapi: 'https://sdzyapi.com/',
            hongniuzy2: 'https://www.hongniuzy2.com/',
            heiycloud: 'https://heiycloud.com/',
            tiankongapi: 'https://m3u8.tiankongapi.com/',
          }
          const mapped = (r.sources ?? []).map(s => ({
            ...s,
            referer: REFERER_MAP[s.siteId] ?? new URL(s.url).origin + '/',
          }))
          backupSourcesRef.current = mapped
          setBackupSources(mapped)
        }
      })
      .catch(() => {})
      .finally(() => {
        backupsFetchedRef.current = true
        setBackupLoading(false)
      })
  }, [episodes, siteId, state?.detailUrl])

  useEffect(() => {
    loadEpisode(currentEpIndex)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const switchSourceGroup = useCallback(async (group: string) => {
    setCurrentGroup(group)
    const ep = episodes[currentEpIndex]
    if (!ep) return
    try {
      const res = await getPlaySources(state?.detailUrl ?? '', siteId, ep.url, group)
      if (res.success && res.sources.length > 0) {
        setSources(res.sources)
        setCurrentSource(res.sources[0]!)
        setActiveSourceName(group)
      }
    } catch { /* 静默失败 */ }
  }, [episodes, currentEpIndex, siteId, state?.detailUrl])

  const switchSource = useCallback((source: BackupSource) => {
    tryingBackupRef.current = false
    currentRefererRef.current = source.referer
    setActiveSourceName(source.siteName)
    setError('')
    setCurrentSource({ url: source.url, format: 'm3u8', quality: source.siteName, needProxy: true })
  }, [])

  const tryNextBackup = useCallback((): boolean => {
    const backups = backupSourcesRef.current
    if (backupIndexRef.current < backups.length) {
      const next = backups[backupIndexRef.current++]
      if (next) {
        currentRefererRef.current = next.referer
        setActiveSourceName(next.siteName)
        setCurrentSource({ url: next.url, format: 'm3u8', quality: next.siteName, needProxy: true })
        return true
      }
    }
    return false
  }, [])

  // HLS 播放
  useEffect(() => {
    if (!currentSource || !videoRef.current) return
    const video = videoRef.current
    const url = currentSource.needProxy
      ? buildProxyUrl(currentSource.url, currentRefererRef.current)
      : currentSource.url

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (currentSource.format === 'm3u8' && Hls.isSupported()) {
      let fallbackCount = 0
      const hls = new Hls({
        autoStartLoad: true,
        maxBufferSize: 30_000_000,
        maxMaxBufferLength: 60,
        startFragPrefetch: true,
        manifestLoadPolicy: { default: { maxLoadTimeMs: 8000, maxTimeToFirstByteMs: 8000, timeoutRetry: { maxNumRetry: 2, retryDelayMs: 2000, maxRetryDelayMs: 4000 }, errorRetry: { maxNumRetry: 2, retryDelayMs: 2000, maxRetryDelayMs: 4000 } } },
        fragLoadPolicy: { default: { maxLoadTimeMs: 8000, maxTimeToFirstByteMs: 8000, timeoutRetry: { maxNumRetry: 2, retryDelayMs: 2000, maxRetryDelayMs: 4000 }, errorRetry: { maxNumRetry: 2, retryDelayMs: 2000, maxRetryDelayMs: 4000 } } },
      })
      hlsRef.current = hls
      hls.loadSource(url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        tryingBackupRef.current = false
        fallbackCount = 0
        if (data.levels?.[0]?.details?.totalduration) {
          setDuration(data.levels[0].details.totalduration)
        }
        video.play().catch(() => {})
      })
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          // 还没拉取到备用源 → 等待
          if (!backupsFetchedRef.current) {
            const waitForBackups = () => {
              if (backupSourcesRef.current.length > 0) {
                tryNextBackup()
              } else if (!backupsFetchedRef.current) {
                setTimeout(waitForBackups, 500)
              } else {
                setError('所有数据源均不可用，请稍后重试或更换搜索关键词')
              }
            }
            waitForBackups()
          } else if (fallbackCount < backupSourcesRef.current.length && tryNextBackup()) {
            fallbackCount++
          } else {
            setError('所有数据源均不可用，请稍后重试或更换搜索关键词')
          }
        }
      })
    } else if (
      currentSource.format === 'm3u8' &&
      video.canPlayType('application/vnd.apple.mpegurl')
    ) {
      video.src = url
    } else {
      video.src = url
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [currentSource]) // eslint-disable-line react-hooks/exhaustive-deps

  // 视频事件绑定
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setIsBuffering(true)
    const onCanPlay = () => setIsBuffering(false)
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      // HLS 流可能在 loadedmetadata 后才更新 duration
      if (video.duration && video.duration !== Infinity && video.duration > 0) {
        setDuration(prev => prev !== video.duration ? video.duration : prev)
      }
      // 更新缓冲进度
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1) / (video.duration || 1) * 100)
      }
    }
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1) / (video.duration || 1) * 100)
      }
    }
    const onLoadedMetadata = () => {
      if (video.duration && video.duration !== Infinity && video.duration > 0) {
        setDuration(video.duration)
      }
    }
    const onEnded = () => {
      if (currentEpIndex < episodes.length - 1) {
        // 预加载下一集播放源
        const nextEp = episodes[currentEpIndex + 1]
        if (nextEp && !preloadedSourcesRef.current.length) {
          getPlaySources(state?.detailUrl ?? '', siteId, nextEp.url)
            .then(res => { if (res.success) preloadedSourcesRef.current = res.sources })
            .catch(() => {})
        }
        setShowNextEpisode(true)
      }
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('progress', onProgress)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('progress', onProgress)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('ended', onEnded)
    }
  }, [currentEpIndex, episodes.length, loading])

  // 全屏事件监听
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  // 保存观看记录
  useEffect(() => {
    if (!state || currentTime < 5) return
    const timer = setTimeout(() => {
      updateHistory({
        site_id: siteId,
        title: state.title ?? '',
        url: state.detailUrl,
        poster: state.poster,
        episode_name: episodes[currentEpIndex]?.name ?? state.episodeName,
        episode_url: episodes[currentEpIndex]?.url ?? state.episodeUrl,
        current_time: currentTime,
        duration,
      })
    }, 5000)
    return () => clearTimeout(timer)
  }, [currentTime, duration, siteId, state, currentEpIndex, episodes])

  // 控件自动隐藏
  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [isPlaying])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
    resetHideTimer()
  }, [resetHideTimer])

  const seek = useCallback((delta: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.duration || Infinity, video.currentTime + delta))
    // 显示快进/快退浮层
    const sign = delta > 0 ? '+' : ''
    setSeekOverlay({ text: `${sign}${delta}s`, side: delta > 0 ? 'right' : 'left' })
    if (seekOverlayTimerRef.current) clearTimeout(seekOverlayTimerRef.current)
    seekOverlayTimerRef.current = setTimeout(() => setSeekOverlay(null), 800)
    resetHideTimer()
  }, [resetHideTimer])

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(time, video.duration))
  }, [])

  // 进度条拖拽
  const wasPlayingBeforeDragRef = useRef(false)
  const { isDragging, dragProgress, dragTime, handlePointerDown } = useProgressDrag({
    progressRef,
    duration,
    onSeek: seekTo,
    onDragStart: () => {
      wasPlayingBeforeDragRef.current = isPlaying
      videoRef.current?.pause()
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      setShowControls(true)
    },
    onDragEnd: () => {
      if (wasPlayingBeforeDragRef.current) videoRef.current?.play().catch(() => {})
      resetHideTimer()
    },
  })

  // 拖拽期间保持控件显示
  useEffect(() => {
    if (!isPlaying || isDragging) {
      setShowControls(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    } else {
      resetHideTimer()
    }
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }
  }, [isPlaying, isDragging, resetHideTimer])

  const handleSetVolume = useCallback((vol: number) => {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.max(0, Math.min(1, vol))
    video.volume = clamped
    setVolume(clamped)
    setIsMuted(clamped === 0)
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture()
      }
    } catch { /* PiP not available */ }
  }, [])

  const handleSetPlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
    setPlaybackRate(rate)
  }, [])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault(); togglePlay(); break
        case 'j':
          e.preventDefault(); seek(-10); break
        case 'l':
          e.preventDefault(); seek(10); break
        case 'ArrowLeft':
          e.preventDefault(); seek(-5); break
        case 'ArrowRight':
          e.preventDefault(); seek(5); break
        case 'ArrowUp':
          e.preventDefault(); handleSetVolume(Math.min(1, volume + 0.1)); break
        case 'ArrowDown':
          e.preventDefault(); handleSetVolume(Math.max(0, volume - 0.1)); break
        case 'f':
          e.preventDefault(); toggleFullscreen(); break
        case 'm':
          e.preventDefault(); toggleMute(); break
        case 'Escape':
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, seek, handleSetVolume, toggleFullscreen, toggleMute, volume])

  const showVolumeOverlay = useCallback((val: number, side: 'left' | 'right') => {
    setVolumeOverlay({ value: val, side })
    if (volumeOverlayTimerRef.current) clearTimeout(volumeOverlayTimerRef.current)
    volumeOverlayTimerRef.current = setTimeout(() => setVolumeOverlay(null), 1200)
  }, [])

  const gestures = useGestureControls({
    onDoubleTapLeft: () => seek(-10),
    onDoubleTapRight: () => seek(10),
    onSwipeUpLeft: () => {},
    onSwipeDownLeft: () => {},
    onSwipeUpRight: (delta) => {
      const newVol = Math.min(1, volume + delta)
      handleSetVolume(newVol)
      showVolumeOverlay(newVol, 'right')
    },
    onSwipeDownRight: (delta) => {
      const newVol = Math.max(0, volume - delta)
      handleSetVolume(newVol)
      showVolumeOverlay(newVol, 'right')
    },
  })

  const formatTime = (s: number): string => {
    if (!s || !isFinite(s)) return '00:00'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    const mm = String(m).padStart(2, '0')
    const ss = String(sec).padStart(2, '0')
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
  }

  const currentEpisodeName = episodes[currentEpIndex]?.name ?? state?.episodeName ?? ''
  const nextEpisodeName = episodes[currentEpIndex + 1]?.name ?? ''
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const
  const progress = duration ? (currentTime / duration) * 100 : 0

  const allSources = [
    { siteId, siteName: activeSourceName || siteId, url: currentSource?.url ?? '', referer: currentRefererRef.current },
    ...backupSources,
  ]

  // 去重：按 siteId 去重，同名源添加后缀区分
  const nameCount: Record<string, number> = {}
  allSources.forEach(s => { nameCount[s.siteName] = (nameCount[s.siteName] || 0) + 1 })
  const uniqueSources = allSources.filter((s, i, arr) =>
    arr.findIndex(x => x.siteId === s.siteId) === i
  )
  const getDisplayName = (s: { siteName: string; siteId: string }) =>
    (nameCount[s.siteName] ?? 0) > 1 ? `${s.siteName} (${s.siteId})` : s.siteName

  /** 播放/暂停按钮 SVG */
  const PlayPauseIcon = ({ size = 24 }: { size?: number }) => (
    isPlaying ? (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    ) : (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
        <polygon points="8,5 8,19 19,12" />
      </svg>
    )
  )

  /** 渲染视频区域（含加载/错误/播放器） */
  const renderVideoArea = () => (
    <>
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p className="text-white/60 text-sm text-center max-w-sm">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); loadEpisode(currentEpIndex) }}
              className="px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
            >
              重试
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(-1) }}
              className="px-5 py-2 rounded-full bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      ) : (
        <>
          <video ref={videoRef} className="w-full h-full object-contain" playsInline />

          {/* 播放中缓冲指示器 */}
          {isBuffering && !loading && (
            <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
              <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* 音量调节浮层 */}
          {volumeOverlay && (
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-30">
              <div className="bg-black/70 rounded-xl px-5 py-3 flex items-center gap-3 backdrop-blur-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  {volumeOverlay.value === 0 ? (
                    <path d="M16.5 12A4.5 4.5 0 0014 8.2v2.1l2.45 2.45c.03-.2.05-.4.05-.6zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  ) : (
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.2v7.6c1.48-.73 2.5-2.25 2.5-3.8z" />
                  )}
                </svg>
                <div className="w-28 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${volumeOverlay.value * 100}%` }} />
                </div>
                <span className="text-white text-xs w-8 text-right">{Math.round(volumeOverlay.value * 100)}</span>
              </div>
            </div>
          )}

          {/* ====== 快进/快退浮层 ====== */}
          {seekOverlay && (
            <div className={`absolute inset-0 flex items-center z-20 pointer-events-none
              ${seekOverlay.side === 'left' ? 'justify-start pl-20' : 'justify-end pr-20'}`}>
              <div className="bg-black/60 backdrop-blur-sm text-white text-lg font-medium px-5 py-3 rounded-xl
                animate-[fadeInOut_0.8s_ease-out]">
                {seekOverlay.text}
              </div>
            </div>
          )}

          {/* ====== 移动端：居中大播放控件 ====== */}
          {isMobile && (
            <div
              className={`absolute inset-0 flex items-center justify-center gap-4 z-10 transition-opacity duration-300
                ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => currentEpIndex > 0 && loadEpisode(currentEpIndex - 1)}
                className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button onClick={togglePlay}
                className="w-24 h-24 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform">
                <PlayPauseIcon size={42} />
              </button>
              <button onClick={() => currentEpIndex < episodes.length - 1 && loadEpisode(currentEpIndex + 1)}
                disabled={currentEpIndex >= episodes.length - 1}
                className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M16 6h2v12h-2zM4 18l8.5-6L4 6z" />
                </svg>
              </button>
            </div>
          )}

          {/* ====== 移动端：右上角工具按钮 ====== */}
          {isMobile && (
            <div
              className={`absolute top-0 right-0 flex gap-2 px-8 py-6 z-10 transition-opacity duration-300
                ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={e => e.stopPropagation()}
            >
              <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" /></svg>
              </button>
              <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" /></svg>
              </button>
              <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
              </button>
            </div>
          )}

          {/* ====== 底部渐变控件区（Web + Mobile 共用） ====== */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-10
              bg-gradient-to-t from-[rgba(8,9,13,0.9)] via-[rgba(8,9,13,0.3)] to-transparent
              backdrop-blur-[1px]
              transition-opacity duration-300
              ${isMobile ? 'px-8 pb-6 pt-12' : 'px-10 pb-4 pt-4'}
              ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* 信息行：标题 + 时间 */}
            <div className="flex items-end justify-between mb-3">
              <p className={`text-white whitespace-nowrap font-light ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {currentEpisodeName}
              </p>
              <p className={`text-white/80 whitespace-nowrap font-light tabular-nums ${isMobile ? 'text-sm' : 'text-base'}`}>
                {formatTime(isDragging ? dragTime : currentTime)} / {formatTime(duration)}
              </p>
            </div>

            {/* 进度条 */}
            <ProgressBar
              ref={progressRef}
              progress={progress}
              buffered={buffered}
              duration={duration}
              isDragging={isDragging}
              dragProgress={dragProgress}
              dragTime={dragTime}
              onPointerDown={handlePointerDown}
              formatTime={formatTime}
            />

            {/* Web 端：底部按钮行 */}
            {!isMobile && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* 播放/暂停 */}
                  <button onClick={togglePlay} className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                    <PlayPauseIcon size={24} />
                  </button>
                  {/* 快退 10s */}
                  <button onClick={() => seek(-10)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors relative">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                    </svg>
                    <span className="absolute text-[8px] font-bold text-white/80 mt-0.5">10</span>
                  </button>
                  {/* 快进 10s */}
                  <button onClick={() => seek(10)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors relative">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                    </svg>
                    <span className="absolute text-[8px] font-bold text-white/80 mt-0.5">10</span>
                  </button>
                  {/* 上一集 */}
                  <button onClick={() => currentEpIndex > 0 && loadEpisode(currentEpIndex - 1)}
                    disabled={currentEpIndex <= 0}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                  </button>
                  {/* 下一集 */}
                  <button onClick={() => currentEpIndex < episodes.length - 1 && loadEpisode(currentEpIndex + 1)}
                    disabled={currentEpIndex >= episodes.length - 1}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M16 6h2v12h-2zM4 18l8.5-6L4 6z" />
                    </svg>
                  </button>
                  {/* 音量 */}
                  <div className="flex items-center group/vol">
                    <button onClick={toggleMute} className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                      {isMuted || volume === 0 ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M16.5 12A4.5 4.5 0 0014 8.2v2.1l2.45 2.45c.03-.2.05-.4.05-.6zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                        </svg>
                      ) : volume < 0.5 ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M18.5 12A4.5 4.5 0 0016 8.2v7.6c1.48-.73 2.5-2.25 2.5-3.8zM5 9v6h4l5 5V4L9 9H5z" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.2v7.6c1.48-.73 2.5-2.25 2.5-3.8z" />
                        </svg>
                      )}
                    </button>
                    <input
                      type="range" min={0} max={1} step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={e => handleSetVolume(Number(e.target.value))}
                      className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-white cursor-pointer opacity-0 group-hover/vol:opacity-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 画中画 */}
                  <button onClick={togglePiP} className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors" title="画中画">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                    </svg>
                  </button>
                  {/* 字幕 */}
                  <button className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors" title="字幕">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z" />
                    </svg>
                  </button>
                  {/* 全屏 */}
                  <button onClick={toggleFullscreen} className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors" title="全屏">
                    {isFullscreen ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                      </svg>
                    )}
                  </button>
                  {/* 更多（播放速度） */}
                  <div className="relative group/speed">
                    <button className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 bg-[#212121] rounded-lg p-1.5 hidden
                      group-hover/speed:block shadow-xl border border-white/5 min-w-[80px]">
                      {SPEEDS.map(s => (
                        <button key={s} onClick={() => handleSetPlaybackRate(s)}
                          className={`block w-full px-3 py-1.5 text-xs rounded-md transition-colors text-left
                            ${playbackRate === s ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile 端底部只显示进度条+信息（控件在中间） */}
          </div>
        </>
      )}

      {/* 下一集倒计时浮层 */}
      {showNextEpisode && nextEpisodeName && (
        <NextEpisodeOverlay
          nextEpisodeName={nextEpisodeName}
          onPlay={() => loadEpisode(currentEpIndex + 1)}
          onCancel={() => setShowNextEpisode(false)}
        />
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* 顶栏 */}
      <div
        className={`flex items-center gap-3 px-4 py-2 bg-[#0f0f0f] transition-opacity duration-300 z-20
          ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white transition-colors">
          ← 返回
        </button>
        <span className="text-white/70 text-sm truncate flex-1">
          {state?.title} - {currentEpisodeName}
        </span>
        {episodes.length > 1 && (
          <button
            onClick={() => setShowEpisodeSidebar(!showEpisodeSidebar)}
            className={`text-sm px-3 py-1 rounded-lg transition-colors
              ${showEpisodeSidebar ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
          >
            剧集
          </button>
        )}
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full">
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 视频播放器 - Figma 风格 */}
          <div
            ref={containerRef}
            className={`relative bg-black w-full cursor-pointer overflow-hidden
              ${isFullscreen ? 'aspect-auto' : 'aspect-video max-h-[70vh]'}
              ${isMobile ? 'rounded-none' : 'md:rounded-[40px] md:mx-4 md:my-2'}`}
            onMouseMove={resetHideTimer}
            onTouchStart={gestures.handleTouchStart}
            onTouchMove={gestures.handleTouchMove}
            onTouchEnd={gestures.handleTouchEnd}
            onClick={togglePlay}
          >
            {renderVideoArea()}
          </div>

          {/* 视频信息 */}
          <div className="px-4 py-3 border-b border-white/5">
            <h1 className="text-white text-lg font-medium leading-tight">
              {state?.title} - {currentEpisodeName}
            </h1>
          </div>

          {/* 清晰度/源组切换 */}
          {availableGroups.length > 1 && (
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#aaa]">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                <span className="text-sm font-medium text-[#f1f1f1]">清晰度</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {availableGroups.map(group => {
                  const isActive = group === currentGroup
                  const label = group.replace(/m3u8$/i, '').replace(/直链$/i, '').trim()
                  return (
                    <button
                      key={group}
                      onClick={() => switchSourceGroup(group)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all
                        ${isActive
                          ? 'bg-[#ff0000] text-white font-medium shadow-lg shadow-[#ff0000]/20'
                          : 'bg-[#272727] text-[#aaa] hover:bg-[#3d3d3d] hover:text-[#f1f1f1]'
                        }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 数据源切换器 - YouTube 风格 */}
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#aaa]">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span className="text-sm font-medium text-[#f1f1f1]">数据源</span>
              {uniqueSources.filter(s => s.url).length > 1 && (
                <span className="text-[10px] bg-[#272727] text-[#aaa] px-1.5 py-0.5 rounded-full">
                  {uniqueSources.filter(s => s.url).length} 个可用
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {uniqueSources.filter(s => s.url).map((s, i) => {
                const isActive = s.siteName === activeSourceName
                return (
                  <button
                    key={`${s.siteId}-${i}`}
                    onClick={() => switchSource(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all
                      ${isActive
                        ? 'bg-[#ff0000] text-white font-medium shadow-lg shadow-[#ff0000]/20'
                        : 'bg-[#272727] text-[#aaa] hover:bg-[#3d3d3d] hover:text-[#f1f1f1]'
                      }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                    {getDisplayName(s)}
                  </button>
                )
              })}
              {backupLoading && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#aaa]">
                  <div className="w-3 h-3 border border-[#aaa]/40 border-t-[#aaa] rounded-full animate-spin" />
                  <span>加载更多源...</span>
                </div>
              )}
            </div>
          </div>

          {/* 剧集列表 */}
          {episodes.length > 1 && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-xs">剧集列表 ({episodes.length}集)</span>
              </div>
              <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto">
                {episodes.map((ep, i) => (
                  <button
                    key={i}
                    onClick={() => loadEpisode(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex-shrink-0
                      ${i === currentEpIndex
                        ? 'bg-white text-black font-medium'
                        : 'bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white/70'}`}
                  >
                    {ep.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 桌面端剧集侧边栏 */}
        {showEpisodeSidebar && episodes.length > 1 && (
          <EpisodeSidebar
            episodes={episodes}
            currentIndex={currentEpIndex}
            onSelect={(i) => loadEpisode(i)}
            onClose={() => setShowEpisodeSidebar(false)}
          />
        )}
      </div>
    </div>
  )
}
