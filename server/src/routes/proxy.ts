import { Router } from 'express'
import http from 'http'
import https from 'https'
import { getTemplateForUrl } from '../proxy/domainTemplates.js'

const router = Router()

/** 跟随重定向（最多5次），返回最终响应 */
function followRedirects(
  url: string,
  headers: Record<string, string>,
  maxHops: number
): Promise<{ res: http.IncomingMessage; finalUrl: string }> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client
      .get(url, { headers }, res => {
        if (
          res.statusCode &&
          [301, 302, 307, 308].includes(res.statusCode) &&
          res.headers.location &&
          maxHops > 0
        ) {
          res.resume()
          const nextUrl = new URL(res.headers.location, url).href
          followRedirects(nextUrl, headers, maxHops - 1)
            .then(resolve)
            .catch(reject)
          return
        }
        resolve({ res, finalUrl: url })
      })
      .on('error', reject)
  })
}

/** 视频流代理 - 解决 CORS 和防盗链 */
router.get('/', async (req, res) => {
  const targetUrl = String(req.query.url ?? '')
  const referer = String(req.query.referer ?? '')

  if (!targetUrl) {
    res.status(400).json({ error: 'Missing url param' })
    return
  }

  try {
    const parsed = new URL(targetUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      res.status(400).json({ error: 'Invalid protocol' })
      return
    }
  } catch {
    res.status(400).json({ error: 'Invalid URL' })
    return
  }

  // 按 CDN 域名自动匹配防盗链模板（优先级高于前端传入的 referer）
  const template = getTemplateForUrl(targetUrl)

  const proxyHeaders: Record<string, string> = {
    'User-Agent':
      template?.userAgent ??
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Encoding': 'identity',
  }
  // 域名模板的 Referer/Origin 覆盖前端传入的
  const effectiveReferer = template?.referer || referer
  if (effectiveReferer) {
    proxyHeaders['Referer'] = effectiveReferer
    proxyHeaders['Origin'] = template?.origin || (() => { try { return new URL(effectiveReferer).origin } catch { return '' } })()
  }
  if (req.headers.range) {
    proxyHeaders['Range'] = req.headers.range
  }

  try {
    const { res: upstream, finalUrl } = await followRedirects(targetUrl, proxyHeaders, 5)
    const contentType = String(upstream.headers['content-type'] ?? '')
    const isM3u8 = contentType.includes('mpegurl') || targetUrl.includes('.m3u8')

    if (isM3u8) {
      // m3u8 内容需要重写相对路径为绝对路径
      const chunks: Buffer[] = []
      upstream.on('data', (chunk: Buffer) => chunks.push(chunk))
      upstream.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8')
        const base = new URL(finalUrl)
        const origin = base.origin
        const dir = finalUrl.substring(0, finalUrl.lastIndexOf('/') + 1)

        // 重写每一行：相对路径 → 代理 URL（子播放列表/分片/加密密钥都通过代理）
        const rewriteUrl = (rawUrl: string): string => {
          let absolute: string
          if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
            absolute = rawUrl
          } else if (rawUrl.startsWith('/')) {
            absolute = origin + rawUrl
          } else {
            absolute = dir + rawUrl
          }
          // m3u8 子播放列表和加密密钥都走代理（保证 Referer 和 CORS）
          if (absolute.includes('.m3u8') || absolute.includes('.key')) {
            const proxyBase = `/api/proxy?url=${encodeURIComponent(absolute)}`
            return effectiveReferer ? `${proxyBase}&referer=${encodeURIComponent(effectiveReferer)}` : proxyBase
          }
          // .ts 分片也走代理（跨域 CORS）
          if (absolute.includes('.ts')) {
            const proxyBase = `/api/proxy?url=${encodeURIComponent(absolute)}`
            return effectiveReferer ? `${proxyBase}&referer=${encodeURIComponent(effectiveReferer)}` : proxyBase
          }
          return absolute
        }

        const rewritten = body.split('\n').map(line => {
          const trimmed = line.trim()
          if (!trimmed) return line

          // 处理 #EXT-X-KEY / #EXT-X-MAP 等包含 URI= 的指令行
          if (trimmed.startsWith('#') && trimmed.includes('URI=')) {
            return trimmed.replace(/URI="([^"]+)"/gi, (_match, uri: string) => {
              return `URI="${rewriteUrl(uri)}"`
            })
          }
          if (!trimmed.startsWith('#')) {
            return rewriteUrl(trimmed)
          }
          return line
        }).join('\n')

        const headers = buildResponseHeaders(upstream)
        headers['Content-Length'] = String(Buffer.byteLength(rewritten))
        res.writeHead(upstream.statusCode ?? 200, headers)
        res.end(rewritten)
      })
      upstream.on('error', (err) => {
        console.error('[proxy] m3u8 读取失败:', err)
        if (!res.headersSent) res.writeHead(502)
        res.end('{"error":"Failed to read m3u8"}')
      })
    } else {
      const headers = buildResponseHeaders(upstream)
      res.writeHead(upstream.statusCode ?? 200, headers)
      upstream.pipe(res)
    }
  } catch (err) {
    console.error('[proxy] 请求失败:', targetUrl, err)
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
    }
    res.end('{"error":"Proxy request failed"}')
  }
})

function buildResponseHeaders(
  proxyRes: http.IncomingMessage
): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': String(
      proxyRes.headers['content-type'] ?? 'application/octet-stream'
    ),
    'Accept-Ranges': 'bytes',
  }
  if (proxyRes.headers['content-length']) {
    headers['Content-Length'] = String(proxyRes.headers['content-length'])
  }
  if (proxyRes.headers['content-range']) {
    headers['Content-Range'] = String(proxyRes.headers['content-range'])
  }
  return headers
}

export default router
