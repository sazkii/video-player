import type { DataSource, DataSourceCategory } from '../types/video'

/**
 * 内置预设第三方视频源
 * 来源：Google Test Bucket、Apple HLS、Blender Foundation、Mux Test Streams
 */
export const PRESET_DATA_SOURCES: DataSource[] = [
  // ─── MP4 直接流 ───────────────────────────────────────────────────────────
  {
    id: 'preset-big-buck-bunny',
    name: 'Big Buck Bunny',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    category: 'mp4',
    format: 'mp4',
    description: 'Blender Foundation 开源动画短片，经典测试视频',
    resolution: '1080p',
  },
  {
    id: 'preset-elephants-dream',
    name: "Elephant's Dream",
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    category: 'mp4',
    format: 'mp4',
    description: 'Blender Foundation 开源动画长片，适合长时间测试',
    resolution: '1080p',
  },
  {
    id: 'preset-sintel',
    name: 'Sintel',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    category: 'mp4',
    format: 'mp4',
    description: 'Blender Foundation VFX 动画短片，画质优秀',
    resolution: '1080p',
  },
  {
    id: 'preset-tears-of-steel',
    name: 'Tears of Steel',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    category: 'mp4',
    format: 'mp4',
    description: 'Blender Foundation 科幻真人短片',
    resolution: '1080p',
  },
  {
    id: 'preset-subaru',
    name: 'Subaru Outback',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    category: 'mp4',
    format: 'mp4',
    description: 'Google 测试视频 - 户外场景',
    resolution: '720p',
  },
  {
    id: 'preset-for-bigger-blazes',
    name: 'For Bigger Blazes',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    category: 'mp4',
    format: 'mp4',
    description: 'Google 测试视频 - 短片',
    resolution: '1080p',
  },
  {
    id: 'preset-for-bigger-escapes',
    name: 'For Bigger Escapes',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    category: 'mp4',
    format: 'mp4',
    description: 'Google 测试视频 - 动作短片',
    resolution: '1080p',
  },
  {
    id: 'preset-for-bigger-fun',
    name: 'For Bigger Fun',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    category: 'mp4',
    format: 'mp4',
    description: 'Google 测试视频 - 趣味短片',
    resolution: '1080p',
  },

  // ─── HLS 流 ───────────────────────────────────────────────────────────────
  {
    id: 'preset-apple-hls-16x9',
    name: 'Apple HLS 16:9 测试流',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    category: 'hls',
    format: 'm3u8',
    description: 'Apple 官方 HLS 测试流，多码率自适应',
    resolution: '1080p',
  },
  {
    id: 'preset-apple-hls-dv',
    name: 'Apple HLS Dolby Vision',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/main.m3u8',
    category: 'hls',
    format: 'm3u8',
    description: 'Apple HLS Dolby Vision + Atmos 测试流',
    resolution: '4K',
  },
  {
    id: 'preset-bitdash-sintel',
    name: 'Bitmovin Sintel HLS',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    category: 'hls',
    format: 'm3u8',
    description: 'Bitmovin 提供的 Sintel HLS 流',
    resolution: '1080p',
  },
  {
    id: 'preset-mux-test',
    name: 'Mux Test Stream',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'hls',
    format: 'm3u8',
    description: 'Mux 提供的测试 HLS 流',
    resolution: '1080p',
  },
  {
    id: 'preset-unified-tears',
    name: 'Unified Streaming Tears of Steel',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    category: 'hls',
    format: 'm3u8',
    description: 'Unified Streaming 提供的 HLS 测试流',
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
