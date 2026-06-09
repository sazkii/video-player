import type { SearchResult, VideoDetail, PlaySource } from '../types/api.js'

export type { SearchResult, VideoDetail, PlaySource }

// dev 模式通过 Vite 代理转发，生产环境使用环境变量
const API_BASE = import.meta.env.VITE_API_URL ?? ''

/** 通用请求封装 */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  return res.json()
}

/** 搜索影视内容 */
export async function searchVideos(
  query: string,
  page = 1,
  siteId?: string
): Promise<{ success: boolean; total: number; results: SearchResult[] }> {
  const params = new URLSearchParams({ q: query, page: String(page) })
  if (siteId) params.set('site', siteId)
  return request(`/api/search?${params}`)
}

/** 获取详情 */
export async function getDetail(
  url: string,
  siteId: string
): Promise<{ success: boolean; detail: VideoDetail }> {
  const params = new URLSearchParams({ url, site: siteId })
  return request(`/api/search/detail?${params}`)
}

/** 获取播放源 */
export async function getPlaySources(
  url: string,
  siteId: string,
  episodeUrl?: string,
  sourceGroup?: string
): Promise<{ success: boolean; sources: PlaySource[] }> {
  const params = new URLSearchParams({ url, site: siteId })
  if (episodeUrl) params.set('episodeUrl', episodeUrl)
  if (sourceGroup) params.set('sourceGroup', sourceGroup)
  return request(`/api/search/sources?${params}`)
}

/** 获取所有数据源的播放地址（用于播放失败时自动切换） */
export async function getAllPlaySources(
  url: string,
  episodeUrl?: string,
  excludeSite?: string,
  episodeIndex = 0
): Promise<{ success: boolean; sources: Array<{ siteId: string; siteName: string; url: string; sourceGroup?: string }> }> {
  const params = new URLSearchParams({ url, episodeIndex: String(episodeIndex) })
  if (episodeUrl) params.set('episodeUrl', episodeUrl)
  if (excludeSite) params.set('exclude', excludeSite)
  return request(`/api/search/sources-all?${params}`)
}

/** 构建代理 URL */
export function buildProxyUrl(url: string, referer?: string): string {
  const params = new URLSearchParams({ url })
  if (referer) params.set('referer', referer)
  return `${API_BASE}/api/proxy?${params}`
}

/** 获取收藏列表 */
export async function getFavorites(): Promise<{
  success: boolean
  favorites: Array<{
    id: number
    site_id: string
    title: string
    url: string
    poster: string | null
    year: string | null
  }>
}> {
  return request('/api/user/favorites')
}

/** 添加收藏 */
export async function addFavorite(data: {
  site_id: string
  title: string
  url: string
  poster?: string
  year?: string
  genre?: string
  description?: string
}): Promise<{ success: boolean }> {
  return request('/api/user/favorites', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** 删除收藏 */
export async function removeFavorite(url: string): Promise<{ success: boolean }> {
  return request(`/api/user/favorites?url=${encodeURIComponent(url)}`, {
    method: 'DELETE',
  })
}

/** 获取观看历史 */
export async function getHistory(): Promise<{
  success: boolean
  history: Array<{
    id: number
    site_id: string
    title: string
    url: string
    poster: string | null
    episode_name: string | null
    current_time: number
    duration: number
    updated_at: string
  }>
}> {
  return request('/api/user/history')
}

/** 更新观看记录 */
export async function updateHistory(data: {
  site_id: string
  title: string
  url: string
  poster?: string
  episode_name?: string
  episode_url?: string
  current_time?: number
  duration?: number
}): Promise<{ success: boolean }> {
  return request('/api/user/history', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** 获取站点列表 */
export async function getSites(): Promise<{
  success: boolean
  sites: Array<{ id: string; name: string; enabled: boolean }>
}> {
  return request('/api/sites')
}

/** 切换站点状态 */
export async function toggleSite(
  id: string,
  enabled: boolean
): Promise<{ success: boolean }> {
  return request('/api/sites/toggle', {
    method: 'POST',
    body: JSON.stringify({ id, enabled }),
  })
}

/** 按分类浏览热门内容 */
export async function browseCategory(
  category?: string,
  page = 1
): Promise<{ success: boolean; results: SearchResult[] }> {
  const params = new URLSearchParams({ page: String(page) })
  if (category) params.set('category', category)
  return request(`/api/browse?${params}`)
}
