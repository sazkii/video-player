import { useState, useRef, useCallback, useEffect } from 'react'
import Hls from 'hls.js'
import type { VideoSource, PlaybackRate } from '../types/video'
import { storage } from '../utils/storage'

const PLAYBACK_RATES: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5, 2]

interface UseVideoPlayerOptions {
  autoplay?: boolean
  defaultVolume?: number
  defaultPlaybackRate?: PlaybackRate
  savePreferences?: boolean
  onEnded?: () => void
}

export function useVideoPlayer(options: UseVideoPlayerOptions = {}) {
  const {
    autoplay = false,
    defaultVolume,
    defaultPlaybackRate,
    savePreferences = true,
    onEnded,
  } = options

  // 保存 onEnded 回调到 ref，避免 useEffect 依赖变化
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded

  // 从 localStorage 读取偏好
  const prefs = savePreferences ? storage.getPreferences() : null

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blobURLsRef = useRef<string[]>([])

  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(defaultVolume ?? prefs?.volume ?? 1)
  const volumeRef = useRef(volume)
  volumeRef.current = volume
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRateState] = useState<PlaybackRate>(
    defaultPlaybackRate ?? prefs?.playbackRate ?? 1
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buffered, setBuffered] = useState(0)
  const [showControls, setShowControls] = useState(true)

  // 保存偏好到 localStorage
  const savePref = useCallback((key: string, value: unknown) => {
    if (savePreferences) {
      storage.savePreferences({ [key]: value })
    }
  }, [savePreferences])

  // === 操作方法 ===

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => setError('播放失败'))
    } else {
      video.pause()
    }
  }, [])

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(time, video.duration || 0))
  }, [])

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration || 0))
  }, [])

  const setVolume = useCallback((vol: number) => {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.max(0, Math.min(1, vol))
    video.volume = clamped
    if (clamped > 0 && video.muted) {
      video.muted = false
    }
    setVolumeState(clamped)
    setIsMuted(clamped === 0)
    savePref('volume', clamped)
  }, [savePref])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  const setPlaybackRate = useCallback((rate: PlaybackRate) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
    setPlaybackRateState(rate)
    savePref('playbackRate', rate)
  }, [savePref])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => setError('无法进入全屏'))
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
    } catch {
      setError('画中画不可用')
    }
  }, [])

  const setSource = useCallback((source: VideoSource) => {
    const video = videoRef.current
    if (!video) return

    // 清理旧的 HLS 实例
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // 清理旧的 blob URLs
    blobURLsRef.current.forEach(url => URL.revokeObjectURL(url))
    blobURLsRef.current = []

    // 重置播放状态
    setCurrentTime(0)
    setDuration(0)
    setBuffered(0)
    setIsPlaying(false)
    setError(null)
    setIsLoading(true)

    if (source.type === 'url' && typeof source.src === 'string') {
      const url = source.src
      // 检查是否是 HLS 流
      if (url.includes('.m3u8') && Hls.isSupported()) {
        const hls = new Hls()
        hlsRef.current = hls
        hls.loadSource(url)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false)
          if (autoplay) video.play().catch(() => {})
        })
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setError(`HLS 加载失败: ${data.type}`)
            setIsLoading(false)
          }
        })
        return
      }
      video.src = url
    } else if (source.type === 'file' && source.src instanceof File) {
      const blobURL = URL.createObjectURL(source.src)
      blobURLsRef.current.push(blobURL)
      video.src = blobURL
    }

    video.load()
  }, [autoplay])

  const clearError = useCallback(() => setError(null), [])

  // === 视频事件绑定 ===
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      // 更新缓冲进度
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1) / (video.duration || 1))
      }
    }
    const onLoadedMetadata = () => setDuration(video.duration)
    const onWaiting = () => setIsLoading(true)
    const onCanPlay = () => setIsLoading(false)
    const handleEnded = () => {
      setIsPlaying(false)
      onEndedRef.current?.()
    }
    const onError = () => {
      const err = video.error
      setError(err ? `视频加载失败 (${err.code})` : '视频加载失败')
      setIsLoading(false)
    }
    const onVolumeChange = () => {
      setVolumeState(video.volume)
      setIsMuted(video.muted)
    }
    const onRateChange = () => setPlaybackRateState(video.playbackRate as PlaybackRate)
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1) / (video.duration || 1))
      }
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', onError)
    video.addEventListener('volumechange', onVolumeChange)
    video.addEventListener('ratechange', onRateChange)
    video.addEventListener('progress', onProgress)

    // 初始化音量
    video.volume = volume
    video.playbackRate = playbackRate

    return () => {
      // 清理 HLS 实例
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      // 清理 blob URLs
      blobURLsRef.current.forEach(url => URL.revokeObjectURL(url))
      blobURLsRef.current = []

      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', onError)
      video.removeEventListener('volumechange', onVolumeChange)
      video.removeEventListener('ratechange', onRateChange)
      video.removeEventListener('progress', onProgress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // === 全屏事件监听 ===
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  // === 控制栏自动隐藏 ===
  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current)
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying && !document.fullscreenElement) {
        setShowControls(false)
      }
    }, 3000)
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true)
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current)
      }
    } else {
      resetHideTimer()
    }
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current)
      }
    }
  }, [isPlaying, resetHideTimer])

  // === 键盘快捷键 ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 输入框获得焦点时跳过
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(5)
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(1, volumeRef.current + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(0, volumeRef.current - 0.1))
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          toggleMute()
          break
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {})
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, skip, setVolume, toggleFullscreen, toggleMute])

  return {
    videoRef,
    containerRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isFullscreen,
    isLoading,
    error,
    buffered,
    showControls,
    playbackRates: PLAYBACK_RATES,
    togglePlay,
    seekTo,
    skip,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleFullscreen,
    togglePiP,
    setSource,
    clearError,
    resetHideTimer,
  }
}

export type UseVideoPlayerReturn = ReturnType<typeof useVideoPlayer>
