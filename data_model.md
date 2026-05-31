# 数据模型: 在线视频播放器

## 1. 核心类型定义

```typescript
// src/types/video.ts

/** 视频来源类型 */
type VideoSourceType = 'file' | 'url'

/** 视频源信息 */
interface VideoSource {
  id: string                    // 唯一标识
  type: VideoSourceType         // 来源类型
  name: string                  // 显示名称
  src: string | File            // URL字符串 或 File对象
  duration?: number             // 时长（秒）
  thumbnail?: string            // 缩略图（blob URL）
}

/** 播放器状态 */
interface PlayerState {
  isPlaying: boolean            // 是否正在播放
  currentTime: number           // 当前播放时间（秒）
  duration: number              // 总时长（秒）
  volume: number                // 音量 0-1
  isMuted: boolean              // 是否静音
  playbackRate: number          // 播放速度
  isFullscreen: boolean         // 是否全屏
  isLoading: boolean            // 是否加载中
  error: string | null          // 错误信息
  buffered: number              // 已缓冲进度（0-1）
}

/** 主题类型 */
type Theme = 'dark' | 'light'

/** 用户偏好设置 */
interface UserPreferences {
  theme: Theme
  volume: number                // 记住音量
  playbackRate: number          // 记住倍速
  urlHistory: string[]          // URL历史记录
}
```

## 2. React State 结构

```typescript
// App 层 state
interface AppState {
  theme: Theme                        // 当前主题
  videoSource: VideoSource | null     // 当前播放源
  playlist: VideoSource[]             // 播放列表
  currentIndex: number                // 当前播放索引
}

// useVideoPlayer Hook 内部 state（通过 useState + useRef）
interface UseVideoPlayerState {
  // 视频元素引用
  videoRef: React.RefObject<HTMLVideoElement>

  // 播放状态（来自 video 元素事件）
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
  buffered: number

  // UI 状态
  isLoading: boolean
  error: string | null
  isFullscreen: boolean
  showControls: boolean              // 控制栏显示/隐藏
}
```

## 3. localStorage 存储结构

```typescript
// 存储键名
const STORAGE_KEYS = {
  PREFERENCES: 'video-player-prefs',     // 用户偏好
  URL_HISTORY: 'video-player-url-history', // URL历史
} as const

// 存储的数据结构
interface StoredPreferences {
  theme: 'dark' | 'light'
  volume: number            // 0-1
  playbackRate: number      // 0.5 | 1 | 1.25 | 1.5 | 2
}

interface StoredURLHistory {
  urls: string[]
  maxEntries: 20            // 最多保存20条
}
```

## 4. 事件流映射

| HTMLVideoEvent | 映射到 State | 触发 UI 更新 |
|----------------|-------------|-------------|
| `play` | isPlaying = true | 播放按钮图标 |
| `pause` | isPlaying = false | 播放按钮图标 |
| `timeupdate` | currentTime = event.time | 进度条位置 + 时间显示 |
| `loadedmetadata` | duration = event.duration | 进度条范围 + 总时间 |
| `volumechange` | volume, isMuted | 音量滑块 + 图标 |
| `ratechange` | playbackRate | 速度标签 |
| `waiting` | isLoading = true | 加载指示器 |
| `canplay` | isLoading = false | 隐藏加载指示器 |
| `ended` | isPlaying = false | 切换到下一个视频 |
| `error` | error = message | 错误提示 |
| `progress` | buffered = 百分比 | 进度条缓冲区 |

## 5. 数据转换规则

### 时间格式化

```
输入: 秒数 (number)
输出: "MM:SS" 或 "HH:MM:SS"

规则:
- duration < 3600 → "MM:SS" (如 "03:45")
- duration >= 3600 → "HH:MM:SS" (如 "1:23:45")
```

### 音量映射

```
内部: 0-1 (浮点)
UI 滑块: 0-100 (整数百分比)
转换: sliderValue = Math.round(volume * 100)
```

### 进度条映射

```
内部: currentTime / duration (0-1 浮点)
UI: CSS percentage (0%-100%)
转换: progress = (currentTime / duration) * 100 + '%'
```
