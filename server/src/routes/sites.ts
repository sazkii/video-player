import { Router } from 'express'
import { getAllAdapters, toggleAdapter } from '../adapters/registry.js'

const router = Router()

/** 获取所有站点 */
router.get('/', (_req, res) => {
  const adapters = getAllAdapters()
  res.json({
    success: true,
    sites: adapters.map(a => ({
      id: a.id,
      name: a.name,
      enabled: a.enabled,
    })),
  })
})

/** 切换站点启用状态 */
router.post('/toggle', (req, res) => {
  const { id, enabled } = req.body as { id?: string; enabled?: boolean }
  if (!id || typeof enabled !== 'boolean') {
    res.json({ success: false, error: '参数错误' })
    return
  }
  const ok = toggleAdapter(id, enabled)
  res.json({ success: ok })
})

export default router
