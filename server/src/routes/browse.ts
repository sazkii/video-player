import { Router } from 'express'
import type { SiteAdapter } from '../adapters/types.js'
import { getEnabledAdapters } from '../adapters/registry.js'

const router = Router()

/**
 * GET /api/browse?category=&page=&siteId=
 * 按分类浏览热门内容
 */
router.get('/', async (req, res) => {
  try {
    const category = String(req.query.category ?? '') || undefined
    const page = Number(req.query.page) || 1
    const siteId = String(req.query.siteId ?? '') || undefined

    const adapters = getEnabledAdapters().filter(
      (a: SiteAdapter) => a.browse && (!siteId || a.id === siteId)
    )

    const results = await Promise.all(
      adapters.map(async (a: SiteAdapter) => {
        try {
          return await a.browse!(category, page)
        } catch {
          return []
        }
      })
    )

    res.json({
      success: true,
      results: results.flat(),
    })
  } catch (err) {
    console.error('浏览失败:', err)
    res.status(500).json({ success: false, error: '浏览失败' })
  }
})

export default router
