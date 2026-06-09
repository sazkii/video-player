import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchState } from '../context/SearchContext'
import TrendingSection from '../components/TrendingSection'

export default function HomePage() {
  const navigate = useNavigate()
  const { searchState } = useSearchState()
  const { results, loading, searched } = searchState

  const goToDetail = useCallback((url: string, siteId: string, title?: string) => {
    navigate('/detail', { state: { url, siteId, title } })
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* 搜索结果 */}
      {searched && (
        <div className="px-4 md:px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-[#272727] rounded-xl" />
                  <div className="flex gap-3 mt-3">
                    <div className="w-9 h-9 rounded-full bg-[#272727] flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-0.5">
                      <div className="h-4 bg-[#272727] rounded w-3/4" />
                      <div className="h-3 bg-[#272727] rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-white/30 py-16">未找到相关结果</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {results.map((item, i) => (
                <button
                  key={`${item.siteId}-${item.url}-${i}`}
                  onClick={() => goToDetail(item.url, item.siteId, item.title)}
                  className="group text-left"
                >
                  <div className="aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden relative">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#272727] to-[#1a1a1a]">
                        <span className="text-3xl font-bold text-white/20">{item.title?.[0] || '?'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-3">
                    <div className="w-9 h-9 rounded-full bg-[#5c4dff] flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                      {item.siteId?.[0]?.toUpperCase() || 'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-2 leading-snug">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#aaa] mt-1">
                        {item.siteId}
                        {item.year && ` · ${item.year}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 热播推荐 - 非搜索时显示 */}
      {!searched && <TrendingSection />}
    </div>
  )
}
