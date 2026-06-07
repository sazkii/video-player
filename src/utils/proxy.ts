/**
 * 构建代理 URL，绕过浏览器 CORS 限制
 * 开发模式: /__proxy__?url=<encoded-url>
 * 生产模式: 直接使用原始 URL（需要目标服务器支持 CORS）
 */
export function buildProxyUrl(url: string): string {
  if (import.meta.env.DEV && url.startsWith('http')) {
    return `/__proxy__?url=${encodeURIComponent(url)}`
  }
  return url
}
