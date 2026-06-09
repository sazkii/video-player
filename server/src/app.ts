import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import searchRoutes from './routes/search.js'
import proxyRoutes from './routes/proxy.js'
import userRoutes from './routes/user.js'
import sitesRoutes from './routes/sites.js'
import browseRoutes from './routes/browse.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json())

// API 路由
app.use('/api/search', searchRoutes)
app.use('/api/proxy', proxyRoutes)
app.use('/api/user', userRoutes)
app.use('/api/sites', sitesRoutes)
app.use('/api/browse', browseRoutes)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// 前端静态文件（build 后 dist 目录）
const distPath = path.resolve(__dirname, '../../dist')
app.use(express.static(distPath))
// SPA fallback — 非 API 路由都返回 index.html
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

export default app
