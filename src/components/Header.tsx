import type { Theme } from '../types/video'

interface HeaderProps {
  theme: Theme
  onThemeToggle: () => void
  onDataSourceOpen: () => void
}

export function Header({ theme, onThemeToggle, onDataSourceOpen }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#e94560] rounded-xl flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
            <polygon points="40,25 40,75 80,50" fill="white"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">Video Player</h1>
      </div>
      <div className="flex items-center gap-2">
        {/* 数据源配置按钮 */}
        <button
          onClick={onDataSourceOpen}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20
                     flex items-center gap-2 transition-colors text-sm text-white/80"
          title="数据源配置"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span className="hidden sm:inline">数据源</span>
        </button>
        <button
          onClick={onThemeToggle}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                     flex items-center justify-center transition-colors
                     text-white text-lg"
          title={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
