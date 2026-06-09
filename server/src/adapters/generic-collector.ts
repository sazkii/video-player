import * as cheerio from 'cheerio'
import type {
  SiteAdapter,
  SearchResult,
  VideoDetail,
  PlaySource,
} from './types.js'

/**
 * 通用采集站适配器
 * 支持常见的苹果 CMS / 资源站 API 格式
 *
 * 典型 API 格式：
 *   搜索: /api.php/provide/vod/?ac=detail&wd=关键词
 *   详情: /api.php/provide/vod/?ac=detail&ids=123
 *   或 HTML 格式:
 *   搜索: /search/----------1---.html
 *   详情: /voddetail/123.html
 */
export class GenericCollectorAdapter implements SiteAdapter {
  id: string
  name: string
  enabled: boolean

  /** 站点根地址 */
  private baseUrl: string
  /** API 路径前缀（如 /api.php/provide/vod） */
  private apiPath?: string
  /** 搜索页路径（HTML 模式） */
  private searchPath?: string
  /** 请求头 */
  private headers: Record<string, string>

  constructor(config: {
    id: string
    name: string
    baseUrl: string
    apiPath?: string
    searchPath?: string
    headers?: Record<string, string>
    enabled?: boolean
  }) {
    this.id = config.id
    this.name = config.name
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.apiPath = config.apiPath
    this.searchPath = config.searchPath
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      ...config.headers,
    }
    this.enabled = config.enabled ?? true
  }

  /** 发起 HTTP 请求 */
  private async fetch(url: string): Promise<string> {
    const res = await fetch(url, { headers: this.headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
    return res.text()
  }

  /** 尝试 API JSON 格式搜索 */
  private async searchApi(
    query: string,
    page: number
  ): Promise<SearchResult[]> {
    const url = `${this.baseUrl}${this.apiPath}?ac=detail&wd=${encodeURIComponent(query)}&pg=${page}`
    const text = await this.fetch(url)
    const data = JSON.parse(text)

    const list: SearchResult[] = []
    const items = data.list ?? data.data ?? []
    for (const item of items) {
      list.push({
        siteId: this.id,
        title: item.vod_name ?? item.title ?? '',
        url: `${this.baseUrl}/voddetail/${item.vod_id ?? item.id}.html`,
        poster: item.vod_pic ?? item.pic ?? undefined,
        year: item.vod_year ?? item.year ?? undefined,
        genre: item.vod_class ?? item.type_name ?? undefined,
        description: item.vod_remarks ?? item.remarks ?? undefined,
        status: item.vod_remarks ?? undefined,
      })
    }
    return list
  }

  /** HTML 格式搜索（解析搜索页） */
  private async searchHtml(
    query: string,
    _page: number
  ): Promise<SearchResult[]> {
    const searchUrl = `${this.baseUrl}${this.searchPath ?? '/search'}`
      .replace('{query}', encodeURIComponent(query))

    const html = await this.fetch(searchUrl)
    const $ = cheerio.load(html)
    const results: SearchResult[] = []

    // 通用搜索结果选择器（适配常见 CMS 模板）
    $('.stui-vodlist__thumb, .search-thumb, .vod_list .item, .search-list a').each(
      (_, el) => {
        const $el = $(el)
        const title =
          $el.attr('title')?.trim() ?? $el.find('.title, h3').text().trim()
        const href = $el.attr('href')?.trim()
        const poster = $el.find('img').attr('data-original') ?? $el.find('img').attr('src')
        const desc = $el.find('.pic-text, .description, p').text().trim()

        if (title && href) {
          results.push({
            siteId: this.id,
            title,
            url: href.startsWith('http')
              ? href
              : `${this.baseUrl}${href}`,
            poster: poster ?? undefined,
            description: desc || undefined,
          })
        }
      }
    )
    return results
  }

  /** 搜索 */
  async search(query: string, page = 1): Promise<SearchResult[]> {
    try {
      // 优先尝试 API 格式
      if (this.apiPath) {
        return await this.searchApi(query, page)
      }
      // 降级到 HTML 解析
      return await this.searchHtml(query, page)
    } catch (err) {
      console.error(`[${this.id}] 搜索失败:`, err)
      return []
    }
  }

  /** 获取详情（剧集列表） */
  async getDetail(url: string): Promise<VideoDetail> {
    const html = await this.fetch(url)
    const $ = cheerio.load(html)

    const title =
      $('h1, .stui-content__detail h1, .vod-info h1').first().text().trim()
    const poster =
      $('img.stui-content__pic, .vod-img img').attr('data-original') ??
      $('img.stui-content__pic, .vod-img img').attr('src') ??
      undefined
    const description = $(
      '.stui-content__desc, .vod-info .desc, .content-detail .intro'
    )
      .text()
      .trim()
    const year = $(
      '.stui-content__detail .data span:contains("年份"), .vod-info .year'
    )
      .text()
      .replace(/[^0-9]/g, '')
      .slice(0, 4)
    const genre = $(
      '.stui-content__detail .data a, .vod-info .type a'
    )
      .map((_, el) => $(el).text().trim())
      .get()

    // 提取剧集列表
    const episodes: { name: string; url: string }[] = []
    $(
      '.stui-content__playlist a, .play-list a, .episode-list a, ul.playlist a'
    ).each((_, el) => {
      const $a = $(el)
      const name = $a.text().trim()
      const href = $a.attr('href')?.trim()
      if (name && href) {
        episodes.push({
          name,
          url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
        })
      }
    })

    return {
      siteId: this.id,
      title,
      url,
      poster,
      year,
      genre,
      description,
      episodes,
    }
  }

  /** 获取播放源 */
  async getPlaySources(detail: VideoDetail, _episodeUrl?: string, _sourceGroup?: string): Promise<PlaySource[]> {
    if (detail.episodes.length === 0) return []

    const sources: PlaySource[] = []
    // 取第一集的播放页面，解析其中的视频地址
    const firstEp = detail.episodes[0]
    if (!firstEp) return []

    try {
      const html = await this.fetch(firstEp.url)
      const $ = cheerio.load(html)

      // 常见的播放地址提取
      // 1. 从 script 中提取 player_data
      const scripts = $('script').toArray()
      for (const script of scripts) {
        const content = $(script).html() ?? ''
        // 匹配 m3u8/mp4 地址
        const m3u8Match = content.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/)
        const mp4Match = content.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/)

        if (m3u8Match?.[0]) {
          sources.push({
            quality: '默认',
            url: m3u8Match[0],
            format: 'm3u8',
            needProxy: true,
          })
          break
        }
        if (mp4Match?.[0]) {
          sources.push({
            quality: '默认',
            url: mp4Match[0],
            format: 'mp4',
            needProxy: true,
          })
          break
        }
      }

      // 2. 从 iframe 嵌入中提取
      if (sources.length === 0) {
        const iframeSrc = $('iframe').first().attr('src')
        if (iframeSrc) {
          // 递归获取 iframe 内容
          const iframeHtml = await this.fetch(
            iframeSrc.startsWith('http')
              ? iframeSrc
              : `${this.baseUrl}${iframeSrc}`
          )
          const iframeMatch = iframeHtml.match(
            /https?:\/\/[^\s"']+\.m3u8[^\s"']*/
          )
          if (iframeMatch?.[0]) {
            sources.push({
              quality: '默认',
              url: iframeMatch[0],
              format: 'm3u8',
              needProxy: true,
            })
          }
        }
      }
    } catch (err) {
      console.error(`[${this.id}] 获取播放源失败:`, err)
    }

    return sources
  }
}
