import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useSearch } from '@/hooks/queries/useSearch'
import { searchVideos } from '@/lib/api'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/cinema/EmptyState'
import { LoadingSpinner } from '@/components/cinema/LoadingSpinner'
import TrendingSection from '@/components/TrendingSection'
import { Search } from 'lucide-react'

interface HomePageProps {
  /** 从 Header 搜索栏传入的已提交查询（外部搜索） */
  submittedQuery?: string
}

export default function HomePage({ submittedQuery: externalQuery = '' }: HomePageProps) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState(externalQuery)
  const { data, isLoading } = useSearch(submittedQuery)
  const results = data?.results ?? []
  const searched = submittedQuery.length > 0

  // 外部搜索触发（来自 Header）
  useEffect(() => {
    if (externalQuery) {
      setSubmittedQuery(externalQuery)
      setQuery(externalQuery)
    }
  }, [externalQuery])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setSubmittedQuery(query)
    qc.prefetchQuery({
      queryKey: ['search', query, 1, undefined],
      queryFn: () => searchVideos(query),
    })
  }, [query, qc])

  const handleClear = useCallback(() => {
    setQuery('')
    setSubmittedQuery('')
  }, [])

  const goToDetail = useCallback((url: string, siteId: string, title?: string) => {
    navigate('/detail', { state: { url, siteId, title } })
  }, [navigate])

  return (
    <div className="min-h-screen bg-background">
      {/* 搜索栏 */}
      <div className="px-4 md:px-6 pt-4 pb-2">
        <div className="relative max-w-xl">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="搜索影视..."
            className="w-full bg-[#272727] text-white text-sm pl-10 pr-4 py-2.5 rounded-full
                       outline-none focus:ring-2 focus:ring-[#ff0000]/50 transition-shadow
                       placeholder:text-white/30"
          />
          {searched && (
            <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs">
              清除
            </button>
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      {searched && (
        <div className="px-4 md:px-6 py-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video rounded-xl" />
                  <div className="flex gap-3">
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 pt-0.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title="未找到相关结果"
              description="试试其他关键词"
              icon={<Search className="h-8 w-8 text-text-muted" />}
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8"
            >
              {results.map((item, i) => (
                <motion.button
                  key={`${item.siteId}-${item.url}-${i}`}
                  variants={staggerItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => goToDetail(item.url, item.siteId, item.title)}
                  className="group text-left"
                >
                  <div className="aspect-video bg-surface-4 rounded-xl overflow-hidden relative">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-6 to-surface-4">
                        <span className="text-3xl font-bold text-text-dim">
                          {item.title?.[0] || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-3">
                    <div className="w-9 h-9 rounded-full bg-brand-purple flex items-center justify-center text-xs font-medium text-white shrink-0">
                      {item.siteId?.[0]?.toUpperCase() || 'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary line-clamp-2 leading-snug">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {item.siteId}
                        {item.year && ` · ${item.year}`}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
          {isLoading && results.length === 0 && (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          )}
        </div>
      )}

      {/* 热播推荐 - 非搜索时显示 */}
      {!searched && <TrendingSection />}
    </div>
  )
}
