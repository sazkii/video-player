import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { browseCategory, type SearchResult } from '../services/api'
import { staggerContainer, staggerItem } from '../lib/animations'
import { Skeleton } from '../components/ui/skeleton'

const CATEGORIES = [
  { label: '电视剧', value: '2' },
  { label: '综艺', value: '3' },
  { label: '动漫', value: '4' },
]

/** 分类标题色 */
const ACCENT_COLORS: Record<string, string> = {
  '2': '#ff0000', // 电视剧 - red
  '3': '#ff6d00', // 综艺 - orange
  '4': '#7c4dff', // 动漫 - purple
}

/** 无封面时的渐变占位 */
function PosterPlaceholder({ title }: { title: string }) {
  const initial = title?.[0] || '?'
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-6 to-surface-4">
      <span className="text-3xl font-bold text-text-dim">{initial}</span>
    </div>
  )
}

export default function TrendingSection() {
  const navigate = useNavigate()
  const [categoryData, setCategoryData] = useState<Record<string, SearchResult[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    // 并行加载所有分类
    Promise.all(
      CATEGORIES.map(cat =>
        browseCategory(cat.value)
          .then(res => ({
            value: cat.value,
            results: res.success ? res.results.slice(0, 10) : [],
          }))
          .catch(() => ({ value: cat.value, results: [] }))
      )
    ).then(data => {
      if (cancelled) return
      const map: Record<string, SearchResult[]> = {}
      data.forEach(d => { map[d.value] = d.results })
      setCategoryData(map)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  const goToDetail = (item: SearchResult) => {
    navigate('/detail', {
      state: { url: item.url, siteId: item.siteId, title: item.title },
    })
  }

  if (loading) {
    return (
      <div className="px-4 md:px-6 py-6 space-y-10">
        {CATEGORIES.map(cat => (
          <div key={cat.value}>
            <Skeleton className="h-5 w-24 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-video rounded-xl" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 md:px-6 py-6 space-y-10">
      {CATEGORIES.map(cat => {
        const items = categoryData[cat.value] ?? []
        if (items.length === 0) return null
        const accent = ACCENT_COLORS[cat.value] || '#ff0000'

        return (
          <motion.section
            key={cat.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* 分类标题 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 rounded-full" style={{ background: accent }} />
              <h2 className="text-lg font-semibold text-text-primary">
                {cat.label}
              </h2>
              <span className="text-xs text-text-secondary">Top {items.length}</span>
            </div>

            {/* 响应式视频网格 */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            >
              {items.map((item, i) => (
                <motion.button
                  key={`${item.siteId}-${i}`}
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goToDetail(item)}
                  className="group text-left"
                >
                  {/* 16:9 缩略图 */}
                  <div className="aspect-video bg-surface-4 rounded-xl overflow-hidden relative">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <PosterPlaceholder title={item.title} />
                    )}
                    {/* 排名角标 */}
                    <div
                      className="absolute top-1.5 left-1.5 w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: accent }}
                    >
                      {i + 1}
                    </div>
                  </div>

                  {/* 标题 + 信息 */}
                  <div className="mt-2 px-0.5">
                    <p className="text-sm font-medium text-text-primary line-clamp-2 leading-snug group-hover:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {item.year && <span>{item.year}</span>}
                      {item.genre && <span>{item.year ? ' · ' : ''}{item.genre}</span>}
                    </p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.section>
        )
      })}
    </div>
  )
}
