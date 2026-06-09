/** 搜索结果 */
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

/** 视频详情 */
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

/** 剧集 */
export interface Episode {
  /** 集名 */
  name: string
  /** 播放源页面 URL */
  url: string
}

/** 播放源 */
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
