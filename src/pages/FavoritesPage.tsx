import { useNavigate } from 'react-router-dom'
import { useFavorites } from '@/hooks/queries/useFavorites'
import { useRemoveFavorite } from '@/hooks/mutations/useRemoveFavorite'
import { X } from 'lucide-react'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useFavorites()
  const removeFav = useRemoveFavorite()
  const favorites = data?.favorites ?? []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/60 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-white px-4 md:px-10 py-8">
      <h1 className="text-2xl font-bold mb-6">我的收藏</h1>

      {favorites.length === 0 ? (
        <p className="text-text-secondary text-center py-16">还没有收藏内容</p>
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
                <div className="aspect-[2/3] bg-surface-2 overflow-hidden rounded-xl">
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
                  <p className="text-sm font-medium truncate text-text-primary">{item.title}</p>
                  {item.year && <p className="text-xs text-text-secondary mt-0.5">{item.year}</p>}
                </div>
              </button>
              <button
                onClick={() => removeFav.mutate(item.url)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center
                           justify-center text-white/60 hover:text-accent opacity-0 group-hover:opacity-100
                           transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
