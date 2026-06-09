import type {
  SiteAdapter,
  SearchResult,
  VideoDetail,
  PlaySource,
} from './types.js'

interface CmsApiAdapterConfig {
  id: string
  name: string
  /** CMS API 根地址，如 https://cj.lziapi.com/api.php/provide/vod */
  cmsApiUrl: string
  enabled?: boolean
}

/**
 * 苹果 CMS JSON API 适配器
 *
 * 支持标准 Apple CMS 提供商 API 格式：
 *   搜索: GET ?ac=detail&wd=关键词&pg=页码
 *   详情: GET ?ac=detail&ids=视频ID
 *
 * 播放地址格式: 剧集名$url#剧集名$url#...
 * 其中 url 可能是直接的 m3u8 链接或需要解析的分享链接
 */
export class LziApiCmsAdapter implements SiteAdapter {
  id: string
  name: string
  enabled: boolean
  private cmsApiUrl: string

  constructor(config: CmsApiAdapterConfig) {
    this.id = config.id
    this.name = config.name
    this.cmsApiUrl = config.cmsApiUrl.replace(/\/$/, '')
    this.enabled = config.enabled ?? true
  }

  private async fetchJson(url: string): Promise<Record<string, unknown>> {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
    return res.json() as Promise<Record<string, unknown>>
  }

  async search(query: string, page = 1): Promise<SearchResult[]> {
    try {
      const url = `${this.cmsApiUrl}?ac=detail&wd=${encodeURIComponent(query)}&pg=${page}`
      const data = await this.fetchJson(url)
      const list = (data.list ?? data.data ?? []) as Array<Record<string, unknown>>

      return list.map(item => ({
        siteId: this.id,
        title: String(item.vod_name ?? item.title ?? ''),
        // detail URL 使用 CMS API 格式，getDetail 可直接请求
        url: `${this.cmsApiUrl}?ac=detail&ids=${item.vod_id ?? item.id}`,
        poster: String(item.vod_pic ?? item.pic ?? ''),
        year: String(item.vod_year ?? item.year ?? ''),
        genre: String(item.vod_class ?? item.type_name ?? ''),
        description: String(item.vod_remarks ?? item.remarks ?? ''),
        status: String(item.vod_remarks ?? ''),
      }))
    } catch (err) {
      console.error(`[${this.id}] 搜索失败:`, err)
      return []
    }
  }

  async getDetail(url: string): Promise<VideoDetail> {
    // URL 可能是 CMS API URL (?ac=detail&ids=xxx) 或网页 URL
    let apiUrl = url
    if (!url.includes('ac=detail')) {
      // 尝试从 URL 中提取 ID
      const idMatch = url.match(/(?:ids?|\/)(\d+)/)
      if (idMatch?.[1]) {
        apiUrl = `${this.cmsApiUrl}?ac=detail&ids=${idMatch[1]}`
      } else {
        apiUrl = url
      }
    }

    const data = await this.fetchJson(apiUrl)
    const items = (data.list ?? data.data ?? []) as Array<Record<string, unknown>>
    const item = items[0]
    if (!item) throw new Error('未找到视频详情')

    // 解析所有源组
    const playUrlRaw = String(item.vod_play_url ?? '')
    const playFromRaw = String(item.vod_play_from ?? '')
    const urlGroups = playUrlRaw.split('$$$')
    const nameGroups = playFromRaw.split('$$$')

    const sourceGroups: Record<string, Array<{ name: string; url: string }>> = {}

    for (let g = 0; g < urlGroups.length; g++) {
      const groupContent = urlGroups[g] ?? ''
      const groupName = (nameGroups[g] ?? `源${g + 1}`).trim()
      const episodes: Array<{ name: string; url: string }> = []
      const pairs = groupContent.split('#').filter(Boolean)

      for (const pair of pairs) {
        const dollarIdx = pair.indexOf('$')
        if (dollarIdx === -1) continue
        const name = pair.substring(0, dollarIdx).trim()
        const videoUrl = pair.substring(dollarIdx + 1).trim()
        if (name && videoUrl) {
          episodes.push({ name, url: videoUrl })
        }
      }

      if (episodes.length > 0) {
        sourceGroups[groupName] = episodes
      }
    }

    // 选择最佳源组作为默认 episodes（优先选含 .m3u8 的组）
    let bestGroupName = Object.keys(sourceGroups)[0] ?? ''
    for (const [name, eps] of Object.entries(sourceGroups)) {
      if (eps.some(ep => ep.url.includes('.m3u8'))) {
        bestGroupName = name
        break
      }
    }

    const episodes = sourceGroups[bestGroupName] ?? []

    return {
      siteId: this.id,
      title: String(item.vod_name ?? ''),
      url: apiUrl,
      poster: String(item.vod_pic ?? ''),
      year: String(item.vod_year ?? ''),
      region: String(item.vod_area ?? ''),
      language: String(item.vod_lang ?? ''),
      genre: String(item.vod_class ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      description: String(item.vod_content?.toString().replace(/<[^>]+>/g, '') ?? ''),
      director: String(item.vod_director ?? ''),
      actors: String(item.vod_actor ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      status: String(item.vod_remarks ?? ''),
      episodes,
      // 仅当有多个源组时返回，避免单源组时产生冗余数据
      sourceGroups: Object.keys(sourceGroups).length > 1 ? sourceGroups : undefined,
    }
  }

  /**
   * 解析分享链接，提取实际 m3u8 地址
   * 分享链接页面通常包含 iframe 或 JS 动态加载的 m3u8
   */
  private async resolveShareLink(shareUrl: string): Promise<string | null> {
    try {
      const headers = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': new URL(shareUrl).origin + '/',
      }

      const res = await fetch(shareUrl, { headers, redirect: 'follow' })
      const html = await res.text()

      // 模式1: 直接匹配 m3u8 URL
      const m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/)
      if (m3u8Match?.[0]) return m3u8Match[0]

      // 模式2: 从 JS 变量中提取（url/src/file/path = "..."）
      const jsMatch = html.match(
        /(?:url|src|file|path)\s*[:=]\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)/i
      )
      if (jsMatch?.[1]) return jsMatch[1]

      // 模式3: iframe 嵌套 — 递归解析
      const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/)
      if (iframeMatch?.[1]) {
        const iframeUrl = new URL(iframeMatch[1], shareUrl).href
        const iframeRes = await fetch(iframeUrl, { headers })
        const iframeHtml = await iframeRes.text()
        const innerMatch = iframeHtml.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/)
        if (innerMatch?.[0]) return innerMatch[0]
      }

      return null
    } catch (err) {
      console.error(`[${this.id}] 分享链接解析失败:`, err)
      return null
    }
  }

  /** 从源组名称中提取简洁的清晰度标签，如 "量子m3u8" → "量子" */
  private extractQualityLabel(groupName: string): string {
    return groupName.replace(/m3u8$/i, '').replace(/直链$/i, '').trim()
  }

  async getPlaySources(detail: VideoDetail, episodeUrl?: string, sourceGroup?: string): Promise<PlaySource[]> {
    // 根据源组选择对应的剧集列表
    const episodes = sourceGroup && detail.sourceGroups?.[sourceGroup]
      ? detail.sourceGroups[sourceGroup]
      : detail.episodes

    if (episodeUrl && episodeUrl.startsWith('http')) {
      let actualUrl = episodeUrl

      // 非直接 m3u8 链接时，尝试解析分享链接
      if (!episodeUrl.includes('.m3u8')) {
        console.log(`[${this.id}] 正在解析分享链接: ${episodeUrl.substring(0, 80)}`)
        const resolved = await this.resolveShareLink(episodeUrl)
        if (resolved) {
          actualUrl = resolved
          console.log(`[${this.id}] 解析成功 → ${resolved.substring(0, 100)}`)
        } else {
          console.warn(`[${this.id}] 分享链接解析失败，将原始链接作为播放地址`)
        }
      }

      return [{
        quality: this.extractQualityLabel(sourceGroup ?? detail.title),
        url: actualUrl,
        format: 'm3u8',
        needProxy: true,
        sourceGroup,
      }]
    }

    if (episodes.length === 0) return []

    const qualityLabel = this.extractQualityLabel(sourceGroup ?? '默认')

    return episodes.map(ep => ({
      quality: qualityLabel,
      url: ep.url,
      format: 'm3u8' as const,
      needProxy: true,
      sourceGroup,
    }))
  }

  /** 按分类浏览热门内容 — Apple CMS ?ac=list&t={typeId}&pg={page} */
  async browse(category?: string, page = 1): Promise<SearchResult[]> {
    try {
      let url = `${this.cmsApiUrl}?ac=list&pg=${page}`
      if (category) url += `&t=${category}`
      const data = await this.fetchJson(url)
      const list = (data.list ?? data.data ?? []) as Array<Record<string, unknown>>
      return list.map(item => ({
        siteId: this.id,
        title: String(item.vod_name ?? item.title ?? ''),
        url: `${this.cmsApiUrl}?ac=detail&ids=${item.vod_id ?? item.id}`,
        poster: String(item.vod_pic ?? item.pic ?? ''),
        year: String(item.vod_year ?? item.year ?? ''),
        genre: String(item.vod_class ?? item.type_name ?? ''),
        description: String(item.vod_remarks ?? item.remarks ?? ''),
        status: String(item.vod_remarks ?? ''),
      }))
    } catch (err) {
      console.error(`[${this.id}] 浏览失败:`, err)
      return []
    }
  }
}
