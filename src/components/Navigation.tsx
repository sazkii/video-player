import { NavLink, useLocation } from 'react-router-dom'
import { Home, Heart, Clock, Settings, Menu } from 'lucide-react'

/** YouTube 风格侧边导航 */
export function SideNav({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const location = useLocation()
  // 播放页不渲染侧边栏
  if (location.pathname === '/player' || location.pathname.startsWith('/player')) return null

  const mainItems = [
    { to: '/', label: '首页', icon: (active: boolean) => (
      <Home className={`h-5 w-5 ${active ? 'text-white fill-white' : 'text-white/60'}`} />
    )},
    { to: '/favorites', label: '收藏', icon: (active: boolean) => (
      <Heart className={`h-5 w-5 ${active ? 'text-white fill-white' : 'text-white/60'}`} />
    )},
    { to: '/history', label: '历史', icon: (active: boolean) => (
      <Clock className={`h-5 w-5 ${active ? 'text-white' : 'text-white/60'}`} />
    )},
  ]

  const libraryItems = [
    { to: '/settings', label: '设置', icon: (active: boolean) => (
      <Settings className={`h-5 w-5 ${active ? 'text-white' : 'text-white/60'}`} />
    )},
  ]

  const navWidth = expanded ? 'w-60' : 'w-[72px]'

  return (
    <nav className={`hidden md:flex flex-col ${navWidth} fixed top-0 left-0 h-full bg-surface-3 z-40
      overflow-y-auto overflow-x-hidden transition-all duration-200`}>
      {/* 顶部：菜单按钮 + Logo */}
      <div className={`flex items-center ${expanded ? 'px-3' : 'justify-center'} h-14 gap-6 sticky top-0 bg-surface-3 z-10`}>
        <button onClick={onToggle} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <Menu className="h-5 w-5 text-white" />
        </button>
        {expanded && (
          <div className="flex items-center gap-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff0000">
              <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.5 15.5V8.5l6.3 3.5-6.3 3.5z" />
            </svg>
            <span className="text-white font-semibold text-lg tracking-tighter">CinemaFlow</span>
          </div>
        )}
      </div>

      {/* 主导航 */}
      <div className={`py-3 ${expanded ? 'px-3' : 'px-0'}`}>
        {mainItems.map(item => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={`flex items-center gap-5 ${expanded ? 'px-3' : 'justify-center'} py-2.5 rounded-lg
                transition-colors group relative ${expanded ? 'mx-1' : ''}`}
            >
              {item.icon(isActive)}
              {expanded && (
                <span className={`text-sm whitespace-nowrap ${isActive ? 'font-medium text-white' : 'text-text-primary'}`}>
                  {item.label}
                </span>
              )}
              {!expanded && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-surface-8 text-white text-xs rounded
                  whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* 分割线 */}
      <div className={`border-t border-white/10 mx-3`} />

      {/* 库/设置 */}
      <div className={`py-3 ${expanded ? 'px-3' : 'px-0'}`}>
        {expanded && (
          <div className="px-3 py-2 mb-1">
            <span className="text-sm font-medium text-text-primary">设置</span>
          </div>
        )}
        {libraryItems.map(item => {
          const isActive = location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-5 ${expanded ? 'px-3' : 'justify-center'} py-2.5 rounded-lg
                transition-colors group relative ${expanded ? 'mx-1' : ''}`}
            >
              {item.icon(isActive)}
              {expanded && (
                <span className={`text-sm whitespace-nowrap ${isActive ? 'font-medium text-white' : 'text-text-primary'}`}>
                  {item.label}
                </span>
              )}
              {!expanded && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-surface-8 text-white text-xs rounded
                  whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

/** YouTube 风格底部导航（移动端） */
export function BottomNav() {
  const location = useLocation()
  if (location.pathname === '/player' || location.pathname.startsWith('/player')) return null

  const items = [
    { to: '/', label: '首页', icon: (active: boolean) => (
      <Home className={`h-5 w-5 ${active ? 'text-white fill-white' : 'text-white/60'}`} />
    )},
    { to: '/favorites', label: '收藏', icon: (active: boolean) => (
      <Heart className={`h-5 w-5 ${active ? 'text-white fill-white' : 'text-white/60'}`} />
    )},
    { to: '/history', label: '历史', icon: (active: boolean) => (
      <Clock className={`h-5 w-5 ${active ? 'text-white' : 'text-white/60'}`} />
    )},
    { to: '/settings', label: '设置', icon: (active: boolean) => (
      <Settings className={`h-5 w-5 ${active ? 'text-white' : 'text-white/60'}`} />
    )},
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-3 border-t border-white/10 z-50 md:hidden">
      <div className="flex items-center justify-around h-14">
        {items.map(item => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className="flex flex-col items-center gap-1 text-[10px] text-text-primary min-w-[48px]"
            >
              {item.icon(isActive)}
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
