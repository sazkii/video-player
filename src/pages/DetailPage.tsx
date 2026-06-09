import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getDetail, addFavorite, removeFavorite, getFavorites } from '../services/api'
import type { VideoDetail } from '../types/api.js'

interface LocationState {
  url: string
  siteId: string
  title?: string
}

export default function DetailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  const [detail, setDetail] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  const url = state?.url ?? ''
  const siteId = state?.siteId ?? ''

  useEffect(() => {
    if (!url || !siteId) return
    setLoading(true)
    getDetail(url, siteId)
      .then(res => {
        if (res.success) setDetail(res.detail)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [url, siteId])

  useEffect(() => {
    if (!url) return
    getFavorites().then(res => {
      if (res.success) {
        setIsFavorite(res.favorites.some(f => f.url === url))
      }
    })
  }, [url])

  const toggleFavorite = useCallback(async () => {
    if (!detail) return
    if (isFavorite) {
      await removeFavorite(url)
      setIsFavorite(false)
    } else {
      await addFavorite({
        site_id: siteId,
        title: detail.title,
        url: detail.url,
        poster: detail.poster,
        year: detail.year,
        genre: detail.genre?.join(','),
        description: detail.description,
      })
      setIsFavorite(true)
    }
  }, [detail, isFavorite, url, siteId])

  const playEpisode = (episodeUrl: string, episodeName: string, episodeIndex: number) => {
    navigate('/player', {
      state: {
        detailUrl: url,
        episodeUrl,
        episodeName,
        episodeIndex,
        episodes: detail?.episodes ?? [],
        siteId,
        title: detail?.title,
        poster: detail?.poster,
      },
    })
  }

  const playFirst = () => {
    const ep = detail?.episodes?.[0]
    if (ep) {
      playEpisode(ep.url, ep.name, 0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff0000]/60 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <p className="text-white/40">未找到详情</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-20">
      {/* 缩略图区域 */}
      <div className="relative w-full aspect-video max-h-[480px] bg-[#181818] overflow-hidden">
        {detail.poster ? (
          <img
            src={detail.poster}
            alt={detail.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#ff0000]/20 to-[#0f0f0f]" />
        )}
        {/* 播放按钮叠加 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={playFirst}
            className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center
                       hover:bg-black/80 transition-colors group"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-6 relative z-10">
        {/* 标题 */}
        <h1 className="text-xl md:text-2xl font-bold leading-snug">{detail.title}</h1>

        {/* 元数据 */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-[#aaa]">
          {detail.year && <span>{detail.year}</span>}
          {detail.region && <span>· {detail.region}</span>}
          {detail.genre?.slice(0, 3).map(g => (
            <span key={g} className="bg-[#272727] px-2 py-0.5 rounded text-xs text-[#f1f1f1]">
              {g}
            </span>
          ))}
        </div>

        {/* YouTube 风格操作按钮行 */}
        <div className="flex items-center gap-2 mt-4 border-b border-white/10 pb-4 overflow-x-auto scrollbar-hide">
          {/* 收藏按钮 */}
          <button
            onClick={toggleFavorite}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${isFavorite
                ? 'bg-[#272727] text-[#ff0000]'
                : 'bg-[#272727] text-[#f1f1f1] hover:bg-[#3d3d3d]'
              }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill={isFavorite ? '#ff0000' : 'none'}
              stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {isFavorite ? '已收藏' : '收藏'}
          </button>

          {/* 分享 */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-[#272727] text-[#f1f1f1] hover:bg-[#3d3d3d] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
            分享
          </button>
        </div>

        {/* 简介 - 可展开 */}
        {detail.description && (
          <div className="mt-4 bg-[#272727] rounded-xl p-3">
            <p className={`text-sm text-[#f1f1f1] leading-relaxed whitespace-pre-wrap
              ${descExpanded ? '' : 'line-clamp-3'}`}>
              {detail.description}
            </p>
            <button
              onClick={() => setDescExpanded(prev => !prev)}
              className="text-sm font-medium text-white mt-2 hover:text-[#3ea6ff] transition-colors"
            >
              {descExpanded ? '收起' : '展开'}
            </button>
          </div>
        )}

        {/* 导演 / 演员 */}
        {(detail.director || detail.actors) && (
          <div className="mt-4 text-sm text-[#aaa] space-y-1">
            {detail.director && <p>导演: {detail.director}</p>}
            {detail.actors && <p>主演: {detail.actors.join(' / ')}</p>}
          </div>
        )}

        {/* 剧集列表 */}
        {detail.episodes.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">
                剧集列表
              </h2>
              <span className="text-sm text-[#aaa]">{detail.episodes.length}集</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {detail.episodes.map((ep, i) => (
                <button
                  key={i}
                  onClick={() => playEpisode(ep.url, ep.name, i)}
                  className="bg-[#272727] hover:bg-[#3d3d3d] border border-transparent
                             hover:border-[#ff0000]/50 rounded-lg py-2.5 px-1 text-sm
                             transition-colors text-center truncate text-[#f1f1f1]"
                >
                  {ep.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
