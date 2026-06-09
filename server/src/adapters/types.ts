/** 站点适配器统一接口 */
export interface SiteAdapter {
  /** 适配器唯一标识 */
  id: string
  /** 站点显示名称 */
  name: string
  /** 是否启用 */
  enabled: boolean

  /** 搜索影视内容 */
  search(query: string, page?: number): Promise<SearchResult[]>

  /** 获取详情页（剧集列表、简介、封面等） */
  getDetail(url: string): Promise<VideoDetail>

  /** 获取播放源地址（多清晰度 m3u8/mp4） */
  getPlaySources(detail: VideoDetail, episodeUrl?: string, sourceGroup?: string): Promise<PlaySource[]>

  /** 按分类浏览热门内容（可选） */
  browse?(category?: string, page?: number): Promise<SearchResult[]>
}

export interface SearchResult {
  /** 来源站点 id */
  siteId: string
  /** 标题 */
  title: string
  /** 详情页 URL（站点原始地址） */
  url: string
  /** 封面图 */
  poster?: string
  /** 年份 */
  year?: string
  /** 类型/标签 */
  genre?: string
  /** 简介摘要 */
  description?: string
  /** 更新状态（连载/完结） */
  status?: string
}

export interface VideoDetail {
  /** 来源站点 id */
  siteId: string
  /** 标题 */
  title: string
  /** 详情页 URL */
  url: string
  /** 封面图 */
  poster?: string
  /** 年份 */
  year?: string
  /** 地区 */
  region?: string
  /** 语言 */
  language?: string
  /** 类型/标签 */
  genre?: string[]
  /** 简介 */
  description?: string
  /** 导演 */
  director?: string
  /** 主演 */
  actors?: string[]
  /** 更新状态 */
  status?: string
  /** 剧集列表 */
  episodes: Episode[]
  /** 所有源组的剧集（key=源组名，如"量子m3u8"） */
  sourceGroups?: Record<string, Episode[]>
}

export interface Episode {
  /** 集名 */
  name: string
  /** 播放源页面 URL */
  url: string
}

export interface PlaySource {
  /** 清晰度标签（如 1080p, 720p） */
  quality: string
  /** 视频 URL（m3u8 或 mp4） */
  url: string
  /** 格式 */
  format: 'm3u8' | 'mp4' | 'webm' | 'other'
  /** 是否需要代理 */
  needProxy: boolean
  /** 所属源组名 */
  sourceGroup?: string
}
