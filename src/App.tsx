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

  const isDark = theme === 'dark'

  // 主题切换（使用函数式更新避免 stale closure）
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      storage.savePreferences({ theme: newTheme })
      return newTheme
    })
  }, [])

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
        if (index < prevIdx) return prevIdx - 1
        if (index === prevIdx && newPlaylist.length > 0) return Math.min(index, newPlaylist.length - 1)
        if (newPlaylist.length === 0) return 0
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
      name: decodeURIComponent(url.split('/').pop() ?? url),
      src: url,
    }
    setPlaylist(prev => {
      const newPlaylist = [...prev, source]
      setCurrentIndex(newPlaylist.length - 1)
      return newPlaylist
    })
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300
      ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#fafafa] text-gray-900'}`}
    >
      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        onDataSourceOpen={() => setShowDataSourcePanel(true)}
      />

      <main className="flex flex-col items-center gap-6 pb-12 pt-2 px-4">
        {/* 视频播放器 */}
        <div className="w-full max-w-4xl">
          <VideoPlayer
            source={videoSource}
            onEnded={handleVideoEnded}
            theme={theme}
          />
          {/* 视频信息栏 */}
          {videoSource && (
            <div className={`mt-2 px-1 flex items-center gap-2
              ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className="text-sm truncate font-medium">{videoSource.name}</span>
              {videoSource.type === 'url' && (
                <span className={`text-[10px] truncate
                  ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                  {typeof videoSource.src === 'string' ? videoSource.src : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <InputArea
          theme={theme}
          onFileSelect={handleFileSelect}
          onURLSubmit={handleURLSubmit}
          isLoading={false}
          error={null}
          onClearError={() => {}}
        />

        {/* 播放列表 */}
        <Playlist
          theme={theme}
          videos={playlist}
          currentIndex={currentIndex}
          onSelect={handleSelectVideo}
          onRemove={handleRemoveVideo}
        />

        {/* 空状态 */}
        {playlist.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
            <p className="text-sm">选择一个数据源开始播放，或拖入本地文件</p>
          </div>
        )}
      </main>

      {/* 数据源配置面板 */}
      <DataSourcePanel
        isOpen={showDataSourcePanel}
        onClose={() => setShowDataSourcePanel(false)}
        onSelect={handleDataSourceSelect}
        theme={theme}
      />
    </div>
  )
}
