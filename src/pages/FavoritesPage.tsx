import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFavorites, removeFavorite } from '../services/api'

interface Favorite {
  id: number
  site_id: string
  title: string
  url: string
  poster: string | null
  year: string | null
}

export default function FavoritesPage() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFavorites()
      .then(res => {
        if (res.success) setFavorites(res.favorites)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (url: string) => {
    await removeFavorite(url)
    setFavorites(prev => prev.filter(f => f.url !== url))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff0000]/60 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 md:px-10 py-8">
      <h1 className="text-2xl font-bold mb-6">我的收藏</h1>

      {favorites.length === 0 ? (
        <p className="text-[#aaa] text-center py-16">还没有收藏内容</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
          {favorites.map(item => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden">
              <button
                onClick={() =>
                  navigate('/detail', {
                    state: { url: item.url, siteId: item.site_id, title: item.title },
                  })
                }
                className="w-full text-left"
              >
                <div className="aspect-[2/3] bg-[#1a1a1a] overflow-hidden rounded-xl">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                      暂无封面
                    </div>
                  )}
                </div>
                <div className="mt-2 px-0.5">
                  <p className="text-sm font-medium truncate text-[#f1f1f1]">{item.title}</p>
                  {item.year && <p className="text-xs text-[#aaa] mt-0.5">{item.year}</p>}
                </div>
              </button>
              <button
                onClick={() => handleRemove(item.url)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center
                           justify-center text-white/60 hover:text-[#ff0000] opacity-0 group-hover:opacity-100
                           transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
