# API 设计: 在线视频播放器 — 模块接口

## 1. useVideoPlayer Hook API

```typescript
/**
 * 核心视频播放器 Hook
 * 封装 HTMLVideoElement 的所有控制逻辑
 */
function useVideoPlayer(options?: UseVideoPlayerOptions): UseVideoPlayerReturn

interface UseVideoPlayerOptions {
  /** 自动播放 */
  autoplay?: boolean
  /** 默认音量 0-1 */
  defaultVolume?: number
  /** 默认播放速度 */
  defaultPlaybackRate?: number
  /** 自动保存偏好到 localStorage */
  savePreferences?: boolean
  /** 视频结束回调（播放列表用） */
  onEnded?: () => void
}

interface UseVideoPlayerReturn {
  /** 视频元素 ref，绑定到 <video> */
  videoRef: React.RefObject<HTMLVideoElement>

  /** === 状态 === */
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
  isFullscreen: boolean
  isLoading: boolean
  error: string | null
  buffered: number

  /** === 操作方法 === */

  /** 切换播放/暂停 */
  togglePlay: () => void

  /** 跳转到指定时间（秒） */
  seekTo: (time: number) => void

  /** 快进/快退 N 秒（默认5秒） */
  skip: (seconds: number) => void

  /** 设置音量 (0-1) */
  setVolume: (volume: number) => void

  /** 切换静音 */
  toggleMute: () => void

  /** 设置播放速度 */
  setPlaybackRate: (rate: PlaybackRate) => void

  /** 切换全屏 */
  toggleFullscreen: () => void

  /** 切换画中画 */
  togglePiP: () => void

  /** 加载新视频源 */
  setSource: (source: VideoSource) => void

  /** 清除错误状态 */
  clearError: () => void
}

type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2
```

## 2. 工具函数 API

```typescript
/**
 * 格式化时间为可读字符串
 * @param seconds - 秒数
 * @returns "MM:SS" 或 "HH:MM:SS"
 */
function formatTime(seconds: number): string

/**
 * 验证视频URL有效性
 * @param url - URL字符串
 * @returns { valid: boolean, type?: 'direct' | 'hls', error?: string }
 */
function validateVideoURL(url: string): URLValidationResult

interface URLValidationResult {
  valid: boolean
  type?: 'direct' | 'hls'
  error?: string
}

/**
 * localStorage 工具函数
 */
const storage = {
  /** 获取用户偏好，无则返回默认值 */
  getPreferences: () => StoredPreferences

  /** 保存用户偏好 */
  savePreferences: (prefs: Partial<StoredPreferences>) => void

  /** 获取URL历史 */
  getURLHistory: () => string[]

  /** 添加URL到历史（最多20条，去重） */
  addURLToHistory: (url: string) => void

  /** 清除URL历史 */
  clearURLHistory: () => void
}
```

## 3. 组件 Props API

```typescript
/** Header 组件 */
interface HeaderProps {
  theme: Theme
  onThemeToggle: () => void
}

/** VideoPlayer 组件 */
interface VideoPlayerProps {
  source: VideoSource | null
  onEnded?: () => void
}

/** Controls 组件 */
interface ControlsProps {
  player: UseVideoPlayerReturn
  visible: boolean
}

/** InputArea 组件 */
interface InputAreaProps {
  onFileSelect: (file: File) => void
  onURLSubmit: (url: string) => void
  isLoading: boolean
  error: string | null
  onClearError: () => void
}

/** DropZone 组件 */
interface DropZoneProps {
  onFileSelect: (file: File) => void
}

/** URLInput 组件 */
interface URLInputProps {
  onSubmit: (url: string) => void
}

/** Playlist 组件 */
interface PlaylistProps {
  videos: VideoSource[]
  currentIndex: number
  onSelect: (index: number) => void
}

/** ProgressBar 组件 */
interface ProgressBarProps {
  currentTime: number
  duration: number
  buffered: number
  onSeek: (time: number) => void
}

/** VolumeControl 组件 */
interface VolumeControlProps {
  volume: number
  isMuted: boolean
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
}

/** SpeedControl 组件 */
interface SpeedControlProps {
  playbackRate: number
  onRateChange: (rate: PlaybackRate) => void
}
```

## 4. 模块依赖关系

```
App.tsx
├── imports Header from components/Header
├── imports VideoPlayer from components/VideoPlayer
├── imports InputArea from components/InputArea
├── imports Playlist from components/Playlist
├── imports storage from utils/storage
└── imports Theme, VideoSource from types/video

VideoPlayer.tsx
├── imports useVideoPlayer from hooks/useVideoPlayer
├── imports Controls from components/Controls
└── imports VideoSource from types/video

useVideoPlayer.ts
├── imports validateVideoURL from utils/validateURL
└── imports storage from utils/storage

InputArea.tsx
├── imports DropZone from components/InputArea/DropZone
└── imports URLInput from components/InputArea/URLInput

URLInput.tsx
└── imports validateVideoURL from utils/validateURL
```
