import type { Theme } from '../types/video'

interface HeaderProps {
  theme: Theme
  onThemeToggle: () => void
  onDataSourceOpen: () => void
}

export function Header({ theme, onThemeToggle, onDataSourceOpen }: HeaderProps) {
  const isDark = theme === 'dark'

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors
      ${isDark
        ? 'bg-[#0a0a0a]/80 border-white/[0.06]'
        : 'bg-white/80 border-gray-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo + 导航 */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#e94560] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
                <polygon points="38,25 38,75 78,50" fill="white" />
              </svg>
            </div>
            <span className={`text-base font-semibold tracking-tight
              ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Video Player
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {['Discover', 'My Playlists', 'Library'].map(item => (
              <button
                key={item}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors
                  ${item === 'Discover'
                    ? isDark ? 'text-white font-medium' : 'text-gray-900 font-medium'
                    : isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-700'
                  }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDataSourceOpen}
            className={`h-9 px-4 rounded-full flex items-center gap-2 transition-all text-sm
              ${isDark
                ? 'bg-white/[0.08] hover:bg-white/[0.14] text-white/80 hover:text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            title="数据源配置"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span className="hidden sm:inline">数据源</span>
          </button>

          <button
            onClick={onThemeToggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all
              ${isDark
                ? 'bg-white/[0.08] hover:bg-white/[0.14] text-white/70 hover:text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800'
              }`}
            title={isDark ? '切换到亮色主题' : '切换到暗色主题'}
          >
            {isDark ? '☀' : '☽'}
          </button>
        </div>
      </div>
    </header>
  )
}
