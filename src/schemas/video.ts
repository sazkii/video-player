import { z } from 'zod'

/** 搜索结果 schema */
export const SearchResultSchema = z.object({
  siteId: z.string(),
  title: z.string(),
  url: z.string(),
  poster: z.string().optional(),
  year: z.string().optional(),
  genre: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
})

export type SearchResult = z.infer<typeof SearchResultSchema>

/** 剧集 schema */
export const EpisodeSchema = z.object({
  name: z.string(),
  url: z.string(),
})

export type Episode = z.infer<typeof EpisodeSchema>

/** 视频详情 schema */
export const VideoDetailSchema = z.object({
  siteId: z.string(),
  title: z.string(),
  url: z.string(),
  poster: z.string().optional(),
  year: z.string().optional(),
  region: z.string().optional(),
  language: z.string().optional(),
  genre: z.array(z.string()).optional(),
  description: z.string().optional(),
  director: z.string().optional(),
  actors: z.array(z.string()).optional(),
  status: z.string().optional(),
  episodes: z.array(EpisodeSchema),
  sourceGroups: z.record(z.string(), z.array(EpisodeSchema)).optional(),
})

export type VideoDetail = z.infer<typeof VideoDetailSchema>

/** 播放源 schema */
export const PlaySourceSchema = z.object({
  quality: z.string(),
  url: z.string(),
  format: z.enum(['m3u8', 'mp4', 'webm', 'other']),
  needProxy: z.boolean(),
  sourceGroup: z.string().optional(),
})

export type PlaySource = z.infer<typeof PlaySourceSchema>

/** 备用数据源 */
export interface BackupSource {
  siteId: string
  siteName: string
  url: string
  referer: string
  sourceGroup?: string
}

/** 站点信息 */
export interface SiteInfo {
  id: string
  name: string
  enabled: boolean
}
