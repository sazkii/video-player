import { useState, useCallback } from 'react'
import type { Theme, VideoSource } from './types/video'
import { storage } from './utils/storage'
import { Header } from './components/Header'
import { VideoPlayer } from './components/VideoPlayer'
import { InputArea } from './components/InputArea'
import { Playlist } from './components/Playlist'
import { DataSourcePanel } from './components/DataSourcePanel'

export default function App() {
  // 主题状态
  const prefs = storage.getPreferences()
  const [theme, setTheme] = useState<Theme>(prefs.theme)

  // 播放列表和当前索引
  const [playlist, setPlaylist] = useState<VideoSource[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // 数据源面板状态
  const [showDataSourcePanel, setShowDataSourcePanel] = useState(false)

  // 派生状态：当前播放源
  const videoSource = playlist[currentIndex] ?? null

  // 主题切换
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    storage.savePreferences({ theme: newTheme })
  }, [theme])

  // 文件选择
  const handleFileSelect = useCallback((file: File) => {
    const source: VideoSource = {
      id: crypto.randomUUID(),
      type: 'file',
      name: file.name,
      src: file,
    }
    setPlaylist(prev => {
      const newPlaylist = [...prev, source]
      // 新视频添加后自动选中最后一个
      setCurrentIndex(newPlaylist.length - 1)
      return newPlaylist
    })
  }, [])

  // URL提交
  const handleURLSubmit = useCallback((url: string) => {
    const source: VideoSource = {
      id: crypto.randomUUID(),
      type: 'url',
      name: url.split('/').pop() ?? url,
      src: url,
    }
    setPlaylist(prev => {
      const newPlaylist = [...prev, source]
      setCurrentIndex(newPlaylist.length - 1)
      return newPlaylist
    })
  }, [])

  // 播放列表选择
  const handleSelectVideo = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // 从播放列表移除
  const handleRemoveVideo = useCallback((index: number) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter((_, i) => i !== index)
      setCurrentIndex(prevIdx => {
        if (index < prevIdx) {
          return prevIdx - 1
        }
        if (index === prevIdx && newPlaylist.length > 0) {
          return Math.min(index, newPlaylist.length - 1)
        }
        if (newPlaylist.length === 0) {
          return 0
        }
        return prevIdx
      })
      return newPlaylist
    })
  }, [])

  // 播放结束，播放下一个
  const handleVideoEnded = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIdx = prev + 1
      return nextIdx < playlist.length ? nextIdx : prev
    })
  }, [playlist.length])

  // 从数据源面板选择播放
  const handleDataSourceSelect = useCallback((url: string) => {
    const source: VideoSource = {
      id: crypto.randomUUID(),
      type: 'url',
      name: url.split('/').pop() ?? url,
      src: url,
    }
    setPlaylist(prev => {
      const newPlaylist = [...prev, source]
      setCurrentIndex(newPlaylist.length - 1)
      return newPlaylist
    })
  }, [])

  const bgClass = theme === 'dark'
    ? 'bg-[#0f0f0f] text-white'
    : 'bg-gray-100 text-gray-900'

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        onDataSourceOpen={() => setShowDataSourcePanel(true)}
      />

      <main className="flex flex-col items-center gap-6 pb-8">
        {/* 视频播放器 */}
        <VideoPlayer
          source={videoSource}
          onEnded={handleVideoEnded}
        />

        {/* 输入区域 */}
        <InputArea
          onFileSelect={handleFileSelect}
          onURLSubmit={handleURLSubmit}
          isLoading={false}
          error={null}
          onClearError={() => {}}
        />

        {/* 播放列表 */}
        <Playlist
          videos={playlist}
          currentIndex={currentIndex}
          onSelect={handleSelectVideo}
          onRemove={handleRemoveVideo}
        />
      </main>

      {/* 数据源配置面板 */}
      <DataSourcePanel
        isOpen={showDataSourcePanel}
        onClose={() => setShowDataSourcePanel(false)}
        onSelect={handleDataSourceSelect}
      />
    </div>
  )
}
