import { useState, useCallback, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { searchVideos } from '@/lib/api'
import { BottomNav, SideNav } from './components/Navigation'
import { Header } from './components/Header'
import { useUIStore } from './stores/ui.store'
import { TooltipProvider } from './components/ui/tooltip'
import { pageTransition } from './lib/animations'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import PlayerPage from './pages/PlayerPage'
import FavoritesPage from './pages/FavoritesPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

/** 包装路由元素，添加页面过渡动画 */
function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

function AppInner() {
  const { sidebarExpanded, toggleSidebar, isMobile, setMobile } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [headerQuery, setHeaderQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [headerSearched, setHeaderSearched] = useState(false)
  const [headerLoading, setHeaderLoading] = useState(false)
  const isPlayer = location.pathname === '/player'

  // 移动端检测
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [setMobile])

  const handleSearch = useCallback(async () => {
    if (!headerQuery.trim()) return
    setHeaderLoading(true)
    setHeaderSearched(true)
    setSubmittedQuery(headerQuery)
    navigate('/')
    try {
      await searchVideos(headerQuery)
    } catch {
      console.error('搜索失败')
    } finally {
      setHeaderLoading(false)
    }
  }, [headerQuery, navigate])

  const handleClearSearch = useCallback(() => {
    setHeaderQuery('')
    setSubmittedQuery('')
    setHeaderSearched(false)
    navigate('/')
  }, [navigate])

  // 播放页：全屏沉浸式，不渲染侧边栏和顶栏
  if (isPlayer) {
    return (
      <div className="min-h-screen bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location}>
              <Route path="/player" element={<PlayerPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  const isDesktop = !isMobile
  const mainMarginLeft = isDesktop ? (sidebarExpanded ? 240 : 72) : 0

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SideNav
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
      />
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
        style={{ marginLeft: mainMarginLeft }}
      >
        <Header
          query={headerQuery}
          onQueryChange={setHeaderQuery}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          searched={headerSearched}
          loading={headerLoading}
        />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedRoute><HomePage submittedQuery={submittedQuery} /></AnimatedRoute>} />
            <Route path="/detail" element={<AnimatedRoute><DetailPage /></AnimatedRoute>} />
            <Route path="/favorites" element={<AnimatedRoute><FavoritesPage /></AnimatedRoute>} />
            <Route path="/history" element={<AnimatedRoute><HistoryPage /></AnimatedRoute>} />
            <Route path="/settings" element={<AnimatedRoute><SettingsPage /></AnimatedRoute>} />
          </Routes>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={300}>
        <AppInner />
      </TooltipProvider>
    </BrowserRouter>
  )
}
