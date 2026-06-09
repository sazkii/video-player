/** CDN 域名防盗链模板
 *  按域名自动设置正确的 Referer/Origin/User-Agent，绕过防盗链检测 */
export interface DomainTemplate {
  referer: string
  origin?: string
  userAgent?: string
}

/**
 * 已知 CDN 域名 → 所需请求头
 * key 为域名（含端口），匹配时包含子域名
 */
const TEMPLATES: Record<string, DomainTemplate> = {
  // 红牛资源 CDN
  'hn.bfvvs.com': {
    referer: 'https://www.hongniuzy2.com/',
    origin: 'https://www.hongniuzy2.com',
  },
  'hnts.ymuuy.com': {
    referer: 'https://www.hongniuzy2.com/',
    origin: 'https://www.hongniuzy2.com',
  },

  // 量子资源 CDN
  'vip.lz-cdn14.com': {
    referer: 'https://cj.lziapi.com/',
    origin: 'https://cj.lziapi.com',
  },
  'cj.lziapi.com': {
    referer: 'https://cj.lziapi.com/',
    origin: 'https://cj.lziapi.com',
  },

  // 光速资源 CDN
  'v.gsuus.com': {
    referer: 'https://api.guangsuapi.com/',
    origin: 'https://api.guangsuapi.com',
  },

  // 闪电资源 CDN
  'v8.qqqrst.com': {
    referer: 'https://sdzyapi.com/',
    origin: 'https://sdzyapi.com',
  },
  'v3.qqqrst.com': {
    referer: 'https://sdzyapi.com/',
    origin: 'https://sdzyapi.com',
  },
  'v2.qqqrst.com': {
    referer: 'https://sdzyapi.com/',
    origin: 'https://sdzyapi.com',
  },
  'sdzyapi.com': {
    referer: 'https://sdzyapi.com/',
    origin: 'https://sdzyapi.com',
  },

  // 非凡资源 CDN
  'heiycloud.com': {
    referer: 'https://heiycloud.com/',
    origin: 'https://heiycloud.com',
  },

  // 天空资源 CDN
  'tiankongapi.com': {
    referer: 'https://m3u8.tiankongapi.com/',
    origin: 'https://m3u8.tiankongapi.com',
  },
  'm3u8.tiankongapi.com': {
    referer: 'https://m3u8.tiankongapi.com/',
    origin: 'https://m3u8.tiankongapi.com',
  },
}

/** 根据 URL 匹配对应的防盗链模板 */
export function getTemplateForUrl(url: string): DomainTemplate | null {
  try {
    const hostname = new URL(url).hostname
    // 精确匹配
    if (TEMPLATES[hostname]) return TEMPLATES[hostname]
    // 子域名匹配（如 hnts.ymuuy.com:65 中的端口需要去掉再匹配）
    const hostWithoutPort = hostname
    for (const [domain, tmpl] of Object.entries(TEMPLATES)) {
      if (hostWithoutPort === domain || hostWithoutPort.endsWith('.' + domain)) {
        return tmpl
      }
    }
  } catch { /* 无效 URL */ }
  return null
}
