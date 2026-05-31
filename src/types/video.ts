/** 视频来源类型 */
export type VideoSourceType = 'file' | 'url'

/** 视频源信息 */
export interface VideoSource {
  id: string
  type: VideoSourceType
  name: string
  src: string | File
  duration?: number
  thumbnail?: string
}

/** 播放器状态 */
export interface PlayerState {
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
}

/** 主题类型 */
export type Theme = 'dark' | 'light'

/** 播放速度选项 */
export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2

/** 用户偏好设置 */
export interface UserPreferences {
  theme: Theme
  volume: number
  playbackRate: PlaybackRate
  urlHistory: string[]
}
