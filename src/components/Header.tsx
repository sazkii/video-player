import type { Theme } from '../types/video'

interface HeaderProps {
  theme: Theme
  onThemeToggle: () => void
}

export function Header({ theme, onThemeToggle }: HeaderProps) {
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
      <button
        onClick={onThemeToggle}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                   flex items-center justify-center transition-colors
                   text-white text-lg"
        title={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
