import { useLocation } from 'react-router-dom'

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#222222] border border-l-0 border-[#303030] rounded-r-full px-6
                       hover:bg-[#303030] transition-colors flex items-center justify-center
                       disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
        </form>

        {/* 右侧操作 */}
        <div className="flex items-center gap-1">
          {/* 主题切换 */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            title="切换主题"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
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
