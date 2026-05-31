# 系统设计: 在线视频播放器

## 1. 技术架构

```mermaid
graph TB
    subgraph "应用层"
        App["App 根组件"]
    end

    subgraph "页面层"
        Header["Header<br/>标题 + 主题切换"]
        VideoSection["视频区域"]
        InputSection["输入区域"]
    end

    subgraph "视频播放层"
        VP["VideoPlayer 组件"]
        Video["Video 元素"]
        Overlay["Overlay<br/>播放按钮/加载"]
        Controls["Controls 控制栏"]
    end

    subgraph "控制组件层"
        PlayBtn["PlayButton"]
        ProgressBar["ProgressBar"]
        TimeDisp["TimeDisplay"]
        VolumeCtrl["VolumeControl"]
        SpeedCtrl["SpeedControl"]
        PiPBtn["PiPButton"]
        FullBtn["FullscreenButton"]
    end

    subgraph "输入层"
        DropZone["DropZone 拖拽上传"]
        URLInput["URLInput 在线地址"]
    end

    subgraph "状态层"
        Hook["useVideoPlayer Hook"]
    end

    subgraph "工具层"
        FormatTime["formatTime()"]
        ValidateURL["validateURL()"]
        Storage["localStorage 工具"]
    end

    App --> Header
    App --> VideoSection
    App --> InputSection

    VideoSection --> VP
    VP --> Video
    VP --> Overlay
    VP --> Controls

    Controls --> PlayBtn
    Controls --> ProgressBar
    Controls --> TimeDisp
    Controls --> VolumeCtrl
    Controls --> SpeedCtrl
    Controls --> PiPBtn
    Controls --> FullBtn

    InputSection --> DropZone
    InputSection --> URLInput

    VP --> Hook
    DropZone --> Hook
    URLInput --> Hook

    Hook --> FormatTime
    Hook --> ValidateURL
    Hook --> Storage
```

## 2. 数据流图

```mermaid
sequenceDiagram
    participant U as 用户
    participant UI as 界面组件
    participant Hook as useVideoPlayer
    participant Vid as HTMLVideoElement

    U->>UI: 拖拽文件 / 输入URL
    UI->>Hook: setSource(file/url)
    Hook->>Vid: 设置 src, load(), play()

    U->>UI: 点击播放/暂停
    UI->>Hook: togglePlay()
    Hook->>Vid: play() / pause()
    Vid-->>Hook: onPlay / onPause 事件
    Hook-->>UI: 更新 isPlaying 状态

    U->>UI: 拖拽进度条
    UI->>Hook: seekTo(time)
    Hook->>Vid: currentTime = time
    Vid-->>Hook: onTimeUpdate 事件
    Hook-->>UI: 更新 currentTime, duration

    U->>UI: 调节音量
    UI->>Hook: setVolume(0.8)
    Hook->>Vid: volume = 0.8
    Vid-->>Hook: onVolumeChange 事件
    Hook-->>UI: 更新 volume, isMuted

    U->>UI: 切换全屏
    UI->>Hook: toggleFullscreen()
    Hook->>Vid: requestFullscreen()
    Vid-->>Hook: onfullscreenchange 事件
    Hook-->>UI: 更新 isFullscreen
```

## 3. 组件关系图

```mermaid
classDiagram
    class App {
        +theme: 'dark' | 'light'
        +videoSrc: VideoSource
        +playlist: VideoSource[]
        +toggleTheme()
    }

    class Header {
        +theme: 'dark' | 'light'
        +onThemeToggle: () => void
    }

    class VideoPlayer {
        +src: VideoSource
        +onEnded: () => void
    }

    class Controls {
        +isPlaying: boolean
        +currentTime: number
        +duration: number
        +volume: number
        +isMuted: boolean
        +playbackRate: number
        +isFullscreen: boolean
    }

    class InputArea {
        +onFileSelect: (file: File) => void
        +onURLSubmit: (url: string) => void
    }

    class Playlist {
        +videos: VideoSource[]
        +currentIndex: number
        +onSelect: (index: number) => void
    }

    class useVideoPlayer {
        <<Hook>>
        +videoRef: RefObject
        +isPlaying: boolean
        +currentTime: number
        +duration: number
        +volume: number
        +isMuted: boolean
        +playbackRate: number
        +isFullscreen: boolean
        +isLoading: boolean
        +error: string | null
        +togglePlay()
        +seekTo(time: number)
        +setVolume(vol: number)
        +toggleMute()
        +setPlaybackRate(rate: number)
        +toggleFullscreen()
        +setSource(src: VideoSource)
    }

    App --> Header
    App --> VideoPlayer
    App --> InputArea
    App --> Playlist
    VideoPlayer --> Controls
    VideoPlayer --> useVideoPlayer
    InputArea ..> useVideoPlayer : setSource()
    Playlist ..> useVideoPlayer : setSource()
```

## 4. 播放器控制状态机

```mermaid
stateDiagram-v2
    [*] --> Idle : 初始状态

    Idle --> Loading : setSource()
    Loading --> Playing : canplaythrough + autoplay
    Loading --> Error : 错误事件

    Playing --> Paused : togglePlay()
    Playing --> Seeking : seekTo()
    Playing --> Loading : setSource(新视频)
    Playing --> Ended : video ended
    Playing --> Error : 错误事件

    Paused --> Playing : togglePlay()
    Paused --> Seeking : seekTo()
    Paused --> Loading : setSource(新视频)

    Seeking --> Playing : seek完成 + wasPlaying
    Seeking --> Paused : seek完成 + wasPaused

    Ended --> Playing : togglePlay() (从头播放)

    Error --> Idle : clearError()
    Error --> Loading : setSource()
```

## 5. 关键设计决策

| 决策点 | 方案 | 理由 |
|--------|------|------|
| 状态管理 | 自定义 Hook | 项目简单，无需 Redux/Zustand |
| 视频格式 | HLS.js + 原生 | 覆盖 mp4/webm + m3u8 流 |
| 样式方案 | Tailwind CSS | 快速开发 + 暗色主题支持 |
| 全屏API | 原生 Fullscreen API | 浏览器原生支持，简单可靠 |
| PiP | 原生 PiP API | 浏览器原生，优雅降级 |
| 持久化 | localStorage | 保存偏好设置，无需后端 |
| 测试 | Vitest + React Testing Library | 与 Vite 生态一致 |

## 6. 目录结构

```
video-player/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── Controls/
│   │   │   ├── index.tsx
│   │   │   ├── PlayButton.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── TimeDisplay.tsx
│   │   │   ├── VolumeControl.tsx
│   │   │   ├── SpeedControl.tsx
│   │   │   ├── PiPButton.tsx
│   │   │   └── FullscreenButton.tsx
│   │   ├── InputArea/
│   │   │   ├── index.tsx
│   │   │   ├── DropZone.tsx
│   │   │   └── URLInput.tsx
│   │   └── Playlist.tsx
│   ├── hooks/
│   │   └── useVideoPlayer.ts
│   ├── utils/
│   │   ├── formatTime.ts
│   │   ├── validateURL.ts
│   │   └── storage.ts
│   ├── types/
│   │   └── video.ts
│   ├── __tests__/
│   │   ├── formatTime.test.ts
│   │   ├── useVideoPlayer.test.ts
│   │   └── components/
│   │       ├── VideoPlayer.test.tsx
│   │       └── Controls.test.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── PROJECT.md
├── PRD.md
└── system_design.md
```
