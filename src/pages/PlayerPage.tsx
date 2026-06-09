import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { VidstackPlayer } from '@/components/PlayerPage/VidstackPlayer'
import { useDetail } from '@/hooks/queries/useDetail'
import { usePlaySources } from '@/hooks/queries/usePlaySources'
import { useUpdateHistory } from '@/hooks/mutations/useUpdateHistory'
import { getAllPlaySources, getPlaySources } from '@/lib/api'
import type { Episode, BackupSource } from '@/schemas/video'
import EpisodeSidebar from '@/components/PlayerPage/EpisodeSidebar'
import NextEpisodeOverlay from '@/components/PlayerPage/NextEpisodeOverlay'

interface LocationState {
  detailUrl: string
  episodeUrl: string
  episodeName: string
  episodeIndex: number
  episodes: Episode[]
  siteId: string
  title?: string
  poster?: string
}

/** 不同站点对应的 referer */
const REFERER_MAP: Record<string, string> = {
  guangsuapi: 'https://api.guangsuapi.com/',
  sdzyapi: 'https://sdzyapi.com/',
  hongniuzy2: 'https://www.hongniuzy2.com/',
  heiycloud: 'https://heiycloud.com/',
  tiankongapi: 'https://m3u8.tiankongapi.com/',
}

export default function PlayerPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null
  const updateHistory = useUpdateHistory()

  const episodes = state?.episodes ?? []
  const siteId = state?.siteId ?? ''
  const [currentEpIndex, setCurrentEpIndex] = useState(state?.episodeIndex ?? 0)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const [showEpisodeSidebar, setShowEpisodeSidebar] = useState(false)
  const [error, setError] = useState('')
  const [currentUrl, setCurrentUrl] = useState(state?.episodeUrl ?? '')
  const [activeSourceName, setActiveSourceName] = useState(siteId)
  const [backupSources, setBackupSources] = useState<BackupSource[]>([])
  const backupIndexRef = useRef(0)
  const backupsLoadedRef = useRef(false)

  const currentEpisode = episodes[currentEpIndex]
  const currentReferer = state?.detailUrl ?? ''

  // 获取当前播放源
  const { data: sourcesRes, isLoading: sourcesLoading } = usePlaySources(
    state?.detailUrl ?? '',
    siteId,
    currentUrl,
  )
  const currentSource = sourcesRes?.sources?.[0]

  // 获取源组（来自详情）
  const { data: detailRes } = useDetail(state?.detailUrl ?? '', siteId)
  const sourceGroups = detailRes?.detail?.sourceGroups
  const availableGroups = sourceGroups ? Object.keys(sourceGroups) : []
  const [currentGroup, setCurrentGroup] = useState('')

  // 加载备用源（跨站备用）
  useEffect(() => {
    if (!state?.detailUrl || !currentEpisode) return
    backupIndexRef.current = 0
    backupsLoadedRef.current = false
    getAllPlaySources(state.detailUrl, currentEpisode.url, siteId, currentEpIndex)
      .then(r => {
        if (r.success) {
          const mapped = (r.sources ?? []).map(s => ({
            ...s,
            referer: REFERER_MAP[s.siteId] ?? new URL(s.url).origin + '/',
          }))
          setBackupSources(mapped)
        }
      })
      .catch(() => {})
      .finally(() => { backupsLoadedRef.current = true })
  }, [currentEpIndex, state?.detailUrl, currentEpisode?.url, siteId])

  // 换集
  const loadEpisode = useCallback((index: number) => {
    setCurrentEpIndex(index)
    setError('')
    setShowNextEpisode(false)
    backupIndexRef.current = 0
    backupsLoadedRef.current = false
    setBackupSources([])
    const ep = episodes[index]
    if (ep) setCurrentUrl(ep.url)
  }, [episodes])

  // 切换源组（同站不同清晰度）
  const switchSourceGroup = useCallback(async (group: string) => {
    setCurrentGroup(group)
    const ep = episodes[currentEpIndex]
    if (!ep) return
    try {
      const res = await getPlaySources(state?.detailUrl ?? '', siteId, ep.url, group)
      if (res.success && res.sources.length > 0 && res.sources[0]) {
        setCurrentUrl(res.sources[0].url)
        setActiveSourceName(group)
      }
    } catch { /* 静默失败 */ }
  }, [episodes, currentEpIndex, siteId, state?.detailUrl])

  // 切换备用源（跨站）
  const switchBackup = useCallback((source: BackupSource) => {
    setActiveSourceName(source.siteName)
    setError('')
    setCurrentUrl(source.url)
  }, [])

  // 播放结束 → 下一集
  const handleEnded = useCallback(() => {
    if (currentEpIndex < episodes.length - 1) {
      setShowNextEpisode(true)
    }
  }, [currentEpIndex, episodes.length])

  // 保存观看记录
  useEffect(() => {
    if (!state) return
    const timer = setTimeout(() => {
      updateHistory.mutate({
        site_id: siteId,
        title: state.title ?? '',
        url: state.detailUrl,
        poster: state.poster,
        episode_name: episodes[currentEpIndex]?.name ?? state.episodeName,
        episode_url: episodes[currentEpIndex]?.url ?? state.episodeUrl,
      })
    }, 5000)
    return () => clearTimeout(timer)
  }, [currentEpIndex, episodes, state, siteId])

  // 渲染视频区域
  const renderVideo = () => {
    if (sourcesLoading) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )
    }
    if (error) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
          <p className="text-white/60 text-sm text-center max-w-sm">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => loadEpisode(currentEpIndex)}
              className="px-5 py-2 rounded-full bg-white text-black text-sm font-medium"
            >
              重试
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-full bg-white/10 text-white/70 text-sm"
            >
              返回
            </button>
          </div>
        </div>
      )
    }
    if (!currentSource) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
          <p className="text-white/40 text-sm">未找到可用播放源</p>
        </div>
      )
    }
    return (
      <VidstackPlayer
        src={currentSource.url}
        referer={currentReferer}
        poster={state?.poster}
        onEnded={handleEnded}
      />
    )
  }

  const currentEpisodeName = currentEpisode?.name ?? state?.episodeName ?? ''

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶栏 */}
      <div className="flex items-center gap-3 px-4 py-2 bg-background z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-white/60 hover:text-white transition-colors text-sm"
        >
          ← 返回
        </button>
        <span className="text-white/70 text-sm truncate flex-1">
          {state?.title} - {currentEpisodeName}
        </span>
        {episodes.length > 1 && (
          <button
            onClick={() => setShowEpisodeSidebar(!showEpisodeSidebar)}
            className={`text-sm px-3 py-1 rounded-lg transition-colors
              ${showEpisodeSidebar ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
          >
            剧集
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full">
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 视频播放器 */}
          <div className="relative bg-black w-full aspect-video max-h-[70vh] md:rounded-[40px] md:mx-4 md:my-2 overflow-hidden">
            {renderVideo()}
          </div>

          {/* 视频信息 */}
          <div className="px-4 py-3 border-b border-white/5">
            <h1 className="text-white text-lg font-medium leading-tight">
              {state?.title} - {currentEpisodeName}
            </h1>
          </div>

          {/* 源组切换 */}
          {availableGroups.length > 1 && (
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-[#f1f1f1]">清晰度</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {availableGroups.map(group => (
                  <button
                    key={group}
                    onClick={() => switchSourceGroup(group)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all
                      ${(group === currentGroup || (!currentGroup && group === availableGroups[0]))
                        ? 'bg-[#ff0000] text-white font-medium shadow-lg shadow-[#ff0000]/20'
                        : 'bg-[#272727] text-[#aaa] hover:bg-[#3d3d3d] hover:text-[#f1f1f1]'}`}
                  >
                    {group.replace(/m3u8$/i, '').replace(/直链$/i, '').trim()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 备用数据源切换 */}
          {backupSources.length > 0 && (
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-[#f1f1f1]">数据源</span>
                <span className="text-[10px] bg-[#272727] text-[#aaa] px-1.5 py-0.5 rounded-full">
                  {backupSources.length + 1} 个可用
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* 当前源 */}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-[#ff0000] text-white font-medium shadow-lg shadow-[#ff0000]/20">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  {activeSourceName || siteId}
                </button>
                {/* 备用源 */}
                {backupSources.map((s, i) => (
                  <button
                    key={`${s.siteId}-${i}`}
                    onClick={() => switchBackup(s)}
                    className="px-3 py-1.5 rounded-lg text-sm bg-[#272727] text-[#aaa] hover:bg-[#3d3d3d] hover:text-[#f1f1f1] transition-all"
                  >
                    {s.siteName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 剧集列表 */}
          {episodes.length > 1 && (
            <div className="px-4 py-3">
              <span className="text-white/50 text-xs">剧集列表 ({episodes.length}集)</span>
              <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto mt-2">
                {episodes.map((ep, i) => (
                  <button
                    key={i}
                    onClick={() => loadEpisode(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex-shrink-0
                      ${i === currentEpIndex
                        ? 'bg-white text-black font-medium'
                        : 'bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white/70'}`}
                  >
                    {ep.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 桌面端剧集侧边栏 */}
        {showEpisodeSidebar && episodes.length > 1 && (
          <EpisodeSidebar
            episodes={episodes}
            currentIndex={currentEpIndex}
            onSelect={(i) => loadEpisode(i)}
            onClose={() => setShowEpisodeSidebar(false)}
          />
        )}
      </div>

      {/* 下一集倒计时 */}
      {showNextEpisode && episodes[currentEpIndex + 1] && (
        <NextEpisodeOverlay
          nextEpisodeName={episodes[currentEpIndex + 1]?.name ?? ''}
          onPlay={() => { loadEpisode(currentEpIndex + 1) }}
          onCancel={() => setShowNextEpisode(false)}
        />
      )}
    </div>
  )
}
