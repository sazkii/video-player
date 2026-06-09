import { useLocation } from 'react-router-dom'
import { Search, X, Moon } from 'lucide-react'

interface HeaderProps {
  query: string
  onQueryChange: (q: string) => void
  onSearch: () => void
  onClearSearch: () => void
  searched: boolean
  loading: boolean
}

export function Header({ query, onQueryChange, onSearch, onClearSearch, searched, loading }: HeaderProps) {
  const location = useLocation()
  const isPlayer = location.pathname === '/player'

  if (isPlayer) return null

  return (
    <header className="sticky top-0 z-30 bg-[#0f0f0f] border-b border-white/[0.06]">
      <div className="h-14 flex items-center justify-between px-4 md:px-6 gap-4">
        {/* 占位 - sidebar 已有 logo */}
        <div className="hidden md:block w-[72px]" />

        {/* 搜索栏 - YouTube 居中样式 */}
        <form
          onSubmit={e => { e.preventDefault(); onSearch() }}
          className="flex-1 max-w-[640px] mx-auto flex"
        >
          <input
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="搜索"
            className="flex-1 bg-[#121212] border border-[#303030] rounded-l-full px-4 py-2
                       text-white text-sm placeholder-white/40 outline-none
                       focus:border-[#1c62b9] transition-colors"
          />
          {(query || searched) && (
            <button
              type="button"
              onClick={onClearSearch}
              className="bg-[#121212] border border-[#303030] border-l-0 px-3
                         hover:bg-[#303030] transition-colors flex items-center justify-center"
              title="返回首页"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#222222] border border-l-0 border-[#303030] rounded-r-full px-6
                       hover:bg-[#303030] transition-colors flex items-center justify-center
                       disabled:opacity-50"
          >
            <Search className="h-5 w-5 text-white" />
          </button>
        </form>

        {/* 右侧操作 */}
        <div className="flex items-center gap-1">
          {/* 主题切换 */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            title="切换主题"
          >
            <Moon className="h-5 w-5 text-white" />
          </button>

          {/* 头像 */}
          <button className="w-8 h-8 rounded-full bg-[#5c4dff] flex items-center justify-center text-xs font-medium text-white ml-1">
            U
          </button>
        </div>
      </div>
    </header>
  )
}
