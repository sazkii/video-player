import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage, ServerResponse } from 'http'
import http from 'http'
import https from 'https'

/**
 * CORS 代理插件
 * 拦截 /__proxy__ 请求，转发到外部 URL 并添加 CORS 头
 * 用法: /__proxy__?url=<encoded-url>
 */
function corsProxyPlugin() {
  return {
    name: 'cors-proxy',
    configureServer(server: { middlewares: { use: (path: string, handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use('/__proxy__', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // 解析目标 URL
        const urlParam = new URL(req.url ?? '/', 'http://localhost').searchParams.get('url')
        if (!urlParam) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end('{"error":"Missing url param"}')
          return
        }

        let targetUrl: string
        try {
          targetUrl = decodeURIComponent(urlParam)
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end('{"error":"Invalid url encoding"}')
          return
        }

        // 安全校验：只允许 http/https
        try {
          const parsed = new URL(targetUrl)
          if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol')
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end('{"error":"Invalid URL"}')
          return
        }

        const client = targetUrl.startsWith('https') ? https : http
        const proxyReq = client.get(targetUrl, {
          headers: {
            'Accept': '*/*',
          },
        }, (proxyRes) => {
          // 跟随重定向（301/302/307/308）
          if (proxyRes.statusCode && [301, 302, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
            const redirectUrl = new URL(proxyRes.headers.location, targetUrl).href
            const redirectClient = redirectUrl.startsWith('https') ? https : http
            const redirectReq = redirectClient.get(redirectUrl, { headers: { 'Accept': '*/*' } }, (redirectRes) => {
              const headers: Record<string, string> = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': '*',
                'Content-Type': redirectRes.headers['content-type'] ?? 'application/octet-stream',
              }
              if (redirectRes.headers['content-length']) {
                headers['Content-Length'] = redirectRes.headers['content-length']
              }
              res.writeHead(redirectRes.statusCode ?? 200, headers)
              redirectRes.pipe(res)
            })
            redirectReq.on('error', () => {
              if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end('{"error":"Redirect failed"}')
            })
            return
          }

          const headers: Record<string, string> = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': proxyRes.headers['content-type'] ?? 'application/octet-stream',
          }
          if (proxyRes.headers['content-length']) {
            headers['Content-Length'] = proxyRes.headers['content-length']
          }
          res.writeHead(proxyRes.statusCode ?? 200, headers)
          proxyRes.pipe(res)
        })

        proxyReq.on('error', () => {
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' })
          }
          res.end('{"error":"Proxy request failed"}')
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    corsProxyPlugin(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
