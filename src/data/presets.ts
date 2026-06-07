import type { DataSource, DataSourceCategory } from '../types/video'

/**
 * 内置预设第三方视频源
 * 所有源均经过验证，支持 CORS 或通过代理播放
 */
export const PRESET_DATA_SOURCES: DataSource[] = [
  // ─── MP4 直接流 ──────────────────────────────────────────────────────────
  {
    id: 'preset-w3schools-bunny',
    name: 'Big Buck Bunny',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    category: 'mp4',
    format: 'mp4',
    description: '经典测试视频，时长10秒，快速验证播放功能',
    resolution: '480p',
  },
  {
    id: 'preset-archive-bunny',
    name: 'Big Buck Bunny 完整版',
    url: 'https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4',
    category: 'mp4',
    format: 'mp4',
    description: 'Archive.org 提供，完整版动画短片，约10分钟',
    resolution: '480p',
  },
  {
    id: 'preset-archive-sintel',
    name: 'Sintel',
    url: 'https://archive.org/download/Sintel/sintel.mp4',
    category: 'mp4',
    format: 'mp4',
    description: 'Archive.org 提供，Blender Foundation VFX 动画短片',
    resolution: '720p',
  },
  {
    id: 'preset-archive-tears',
    name: 'Tears of Steel',
    url: 'https://archive.org/download/TearsOfSteel-movie-4k/tears_of_steel_4k.mov',
    category: 'mp4',
    format: 'other',
    description: 'Archive.org 提供，科幻真人+CG短片',
    resolution: '4K',
  },

  // ─── HLS 流（Apple 官方 CDN，通过代理可播放） ─────────────────────────────
  {
    id: 'preset-apple-hls-16x9',
    name: 'Apple HLS 16:9',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    category: 'hls',
    format: 'm3u8',
    description: 'Apple 官方 HLS 测试流，多码率自适应，支持字幕',
    resolution: '1080p',
  },
  {
    id: 'preset-apple-hls-4x3',
    name: 'Apple HLS 4:3',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
    category: 'hls',
    format: 'm3u8',
    description: 'Apple 官方 HLS 测试流，4:3 传统比例',
    resolution: '720p',
  },
  {
    id: 'preset-bitmovin-sintel',
    name: 'Bitmovin Sintel HLS',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    category: 'hls',
    format: 'm3u8',
    description: 'Bitmovin 提供的 Sintel HLS 流，经典测试流',
    resolution: '1080p',
  },
]

/**
 * 按分类获取预设数据源
 */
export function getPresetByCategory(category: DataSourceCategory): DataSource[] {
  if (category === 'preset') return PRESET_DATA_SOURCES
  return PRESET_DATA_SOURCES.filter(s => s.category === category)
}

/**
 * 获取所有分类
 */
export function getSourceCategories(): { id: DataSourceCategory; name: string; count: number }[] {
  const categories: DataSourceCategory[] = ['mp4', 'hls', 'preset']
  return categories.map(cat => ({
    id: cat,
    name: cat === 'mp4' ? 'MP4 直接流' : cat === 'hls' ? 'HLS 流' : '全部预设',
    count: cat === 'preset'
      ? PRESET_DATA_SOURCES.length
      : PRESET_DATA_SOURCES.filter(s => s.category === cat).length,
  }))
}
