import { useState, useCallback, useEffect } from 'react'
import type { Theme, VideoSource } from './types/video'
import { storage } from './utils/storage'
import { Header } from './components/Header'
import { VideoPlayer } from './components/VideoPlayer'
import { Playlist } from './components/Playlist'
import { DataSourcePanel } from './components/DataSourcePanel'

export default function App() {
  const prefs = storage.getPreferences()
  const [theme, setTheme] = useState<Theme>(prefs.theme)

  // 主题同步：监听 storage 变化（其他标签页切换时同步）
  useEffect(() => {
    const current = storage.getPreferences().theme
    if (current !== theme) setTheme(current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [playlist, setPlaylist] = useState<VideoSource[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDataSourcePanel, setShowDataSourcePanel] = useState(false)
  const [showURLInput, setShowURLInput] = useState(false)

  const videoSource = playlist[currentIndex] ?? null
  const isDark = theme === 'dark'

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      storage.savePreferences({ theme: newTheme })
      return newTheme
    })
  }, [])

  const handleURLSubmit = useCallback((url: string) => {
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
    setShowURLInput(false)
  }, [])

  const handleSelectVideo = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

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

  const handleVideoEnded = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIdx = prev + 1
      return nextIdx < playlist.length ? nextIdx : prev
    })
  }, [playlist.length])

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-8">
        {/* 视频播放器区域 */}
        <section className="max-w-5xl mx-auto">
          <VideoPlayer
            source={videoSource}
            onEnded={handleVideoEnded}
            theme={theme}
          />

          {/* 视频标题栏 */}
          {videoSource && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1 h-5 bg-[#e94560] rounded-full flex-shrink-0" />
                <h2 className={`text-sm font-medium truncate
                  ${isDark ? 'text-white/85' : 'text-gray-800'}`}>
                  {videoSource.name}
                </h2>
              </div>
              <button
                onClick={() => setShowURLInput(!showURLInput)}
                className={`flex-shrink-0 h-8 px-3 rounded-full text-xs flex items-center gap-1.5 transition-all
                  ${isDark
                    ? 'bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white/80'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                添加
              </button>
            </div>
          )}

          {/* 内联 URL 输入 */}
          {showURLInput && (
            <div className="mt-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.target as HTMLFormElement
                  const input = form.elements.namedItem('urlInput') as HTMLInputElement
                  if (input?.value.trim()) {
                    handleURLSubmit(input.value.trim())
                    input.value = ''
                  }
                }}
                className="flex gap-2"
              >
                <input
                  name="urlInput"
                  type="url"
                  placeholder="输入视频 URL (mp4, webm, m3u8...)"
                  className={`flex-1 h-9 px-4 rounded-full text-sm border outline-none transition-colors
                    ${isDark
                      ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-white/25 focus:border-[#e94560]/50'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#e94560]/50'
                    }`}
                />
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#e94560] hover:bg-[#e94560]/85 text-white text-sm
                             font-medium rounded-full transition-colors"
                >
                  播放
                </button>
              </form>
            </div>
          )}
        </section>

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
          <section className="text-center py-20">
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center
              ${isDark ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db'} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <p className={`text-sm mb-1 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
              点击「数据源」选择视频开始播放
            </p>
            <p className={`text-xs ${isDark ? 'text-white/18' : 'text-gray-300'}`}>
              支持拖拽本地文件或粘贴在线视频 URL
            </p>
          </section>
        )}
      </main>

      <DataSourcePanel
        isOpen={showDataSourcePanel}
        onClose={() => setShowDataSourcePanel(false)}
        onSelect={handleDataSourceSelect}
        theme={theme}
      />
    </div>
  )
}
