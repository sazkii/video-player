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
        // 处理 CORS 预检请求
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400',
          })
          res.end()
          return
        }

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

        // 转发 Range 请求头（支持视频拖拽/分段加载）
        const proxyHeaders: Record<string, string> = { 'Accept': '*/*' }
        const range = req.headers.range
        if (range) {
          proxyHeaders['Range'] = range
        }

        const isHead = req.method === 'HEAD'
        const client = targetUrl.startsWith('https') ? https : http
        const requestFn = isHead ? client.head : client.get
        const proxyReq = requestFn.call(client, targetUrl, { headers: proxyHeaders }, (proxyRes) => {
          // 跟随重定向（301/302/307/308）
          if (proxyRes.statusCode && [301, 302, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
            const redirectUrl = new URL(proxyRes.headers.location, targetUrl).href
            const redirectClient = redirectUrl.startsWith('https') ? https : http
            const redirectHeaders: Record<string, string> = { 'Accept': '*/*' }
            if (range) redirectHeaders['Range'] = range
            const redirectReq = redirectClient.get(redirectUrl, { headers: redirectHeaders }, (redirectRes) => {
              const headers: Record<string, string> = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': '*',
                'Content-Type': redirectRes.headers['content-type'] ?? 'application/octet-stream',
                'Accept-Ranges': 'bytes',
              }
              if (redirectRes.headers['content-length']) {
                headers['Content-Length'] = redirectRes.headers['content-length']
              }
              if (redirectRes.headers['content-range']) {
                headers['Content-Range'] = redirectRes.headers['content-range']
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
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': proxyRes.headers['content-type'] ?? 'application/octet-stream',
            'Accept-Ranges': 'bytes',
          }
          if (proxyRes.headers['content-length']) {
            headers['Content-Length'] = proxyRes.headers['content-length']
          }
          if (proxyRes.headers['content-range']) {
            headers['Content-Range'] = proxyRes.headers['content-range']
          }
          res.writeHead(proxyRes.statusCode ?? 200, headers)
          // 流式传输，不缓冲整个响应
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
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
