import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { SearchProvider, useSearchState } from './context/SearchContext'
import { searchVideos } from './services/api'
import { BottomNav, SideNav } from './components/Navigation'
import { Header } from './components/Header'
import { useMediaQuery } from './hooks/useMediaQuery'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import PlayerPage from './pages/PlayerPage'
import FavoritesPage from './pages/FavoritesPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

function AppInner() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { searchState, setQuery, setResults, setLoading, setSearched } = useSearchState()
  const isPlayer = location.pathname === '/player'
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const handleSearch = useCallback(async () => {
    if (!searchState.query.trim()) return
    setLoading(true)
    setSearched(true)
    navigate('/')
    try {
      const res = await searchVideos(searchState.query)
      if (res.success) setResults(res.results)
    } catch {
      console.error('搜索失败')
    } finally {
      setLoading(false)
    }
  }, [searchState.query, setLoading, setResults, setSearched, navigate])

  const handleClearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setSearched(false)
    navigate('/')
  }, [setQuery, setResults, setSearched, navigate])

  // 播放页：全屏沉浸式，不渲染侧边栏和顶栏
  if (isPlayer) {
    return (
      <div className="min-h-screen bg-black">
        <Routes>
          <Route path="/player" element={<PlayerPage />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SideNav
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(prev => !prev)}
      />
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
        style={{ marginLeft: isDesktop ? (sidebarExpanded ? 240 : 72) : 0 }}
      >
        <Header
          query={searchState.query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          searched={searchState.searched}
          loading={searchState.loading}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/detail" element={<DetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SearchProvider>
        <AppInner />
      </SearchProvider>
    </BrowserRouter>
  )
}
