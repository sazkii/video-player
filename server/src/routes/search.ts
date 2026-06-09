import { Router } from 'express'
import { getEnabledAdapters } from '../adapters/registry.js'
import { getCmsSourcesFromEnv } from '../config.js'

const router = Router()

/** 搜索接口 */
router.get('/', async (req, res) => {
  const query = String(req.query.q ?? '')
  const page = Number(req.query.page ?? 1)
  const siteId = req.query.site as string | undefined

  if (!query.trim()) {
    res.json({ success: false, error: '搜索关键词不能为空' })
    return
  }

  try {
    const adapters = getEnabledAdapters()
    const targets = siteId
      ? adapters.filter(a => a.id === siteId)
      : adapters

    // 并发搜索所有启用的站点
    const results = await Promise.allSettled(
      targets.map(adapter => adapter.search(query, page))
    )

    const allResults = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r.status === 'fulfilled' ? r.value : []))

    res.json({
      success: true,
      total: allResults.length,
      results: allResults,
    })
  } catch (err) {
    console.error('搜索错误:', err)
    res.json({ success: false, error: '搜索失败' })
  }
})

/** 获取详情 */
router.get('/detail', async (req, res) => {
  const url = String(req.query.url ?? '')
  const siteId = String(req.query.site ?? '')

  if (!url) {
    res.json({ success: false, error: 'URL 不能为空' })
    return
  }

  try {
    const { getAdapter } = await import('../adapters/registry.js')
    const adapter = getAdapter(siteId)
    if (!adapter) {
      res.json({ success: false, error: '未找到站点适配器' })
      return
    }

    const detail = await adapter.getDetail(url)
    res.json({ success: true, detail })
  } catch (err) {
    console.error('获取详情错误:', err)
    res.json({ success: false, error: '获取详情失败' })
  }
})

/** 获取播放源 */
router.get('/sources', async (req, res) => {
  const url = String(req.query.url ?? '')
  const episodeUrl = String(req.query.episodeUrl ?? '') || undefined
  const siteId = String(req.query.site ?? '')
  const sourceGroup = String(req.query.sourceGroup ?? '') || undefined

  if (!url) {
    res.json({ success: false, error: 'URL 不能为空' })
    return
  }

  try {
    const { getAdapter } = await import('../adapters/registry.js')
    const adapter = getAdapter(siteId)
    if (!adapter) {
      res.json({ success: false, error: '未找到站点适配器' })
      return
    }

    const detail = await adapter.getDetail(url)
    const sources = await adapter.getPlaySources(detail, episodeUrl, sourceGroup)
    console.log('[sources]', siteId, 'episodeUrl:', episodeUrl?.substring(0, 80), '→ resolved:', sources[0]?.url?.substring(0, 100))
    res.json({ success: true, sources })
  } catch (err) {
    console.error('获取播放源错误:', err)
    res.json({ success: false, error: '获取播放源失败' })
  }
})

/** 获取所有启用适配器的播放源（用于自动切换源） */
router.get('/sources-all', async (req, res) => {
  const url = String(req.query.url ?? '')
  const episodeIndex = Number(req.query.episodeIndex ?? 0)
  const excludeSite = String(req.query.exclude ?? '')

  if (!url) {
    res.json({ success: false, error: 'URL 不能为空' })
    return
  }

  // 从 URL 中提取视频 ID
  const idMatch = url.match(/ids?=(\d+)/) ?? url.match(/\/(\d+)/)
  const videoId = idMatch?.[1]
  if (!videoId) {
    res.json({ success: false, error: '无法从 URL 提取视频 ID' })
    return
  }

  // 从环境变量获取 CMS API 列表
  const cmsSources = getCmsSourcesFromEnv()
    .filter(s => s.id !== excludeSite)
    .map(s => ({ id: s.id, name: s.name, apiUrl: s.cmsApiUrl }))

  const results = await Promise.allSettled(
    cmsSources.map(async (cms) => {
      try {
        const apiUrl = `${cms.apiUrl}?ac=detail&ids=${videoId}`
        const r = await fetch(apiUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(10_000),
        })
        if (!r.ok) return null
        const data = await r.json() as Record<string, unknown>
        const list = (data.list ?? data.data ?? []) as Array<Record<string, unknown>>
        const item = list[0]
        if (!item) return null

        // 解析所有源组（含 vod_play_from 源组名）
        const playUrlRaw = String(item.vod_play_url ?? '')
        const playFromRaw = String(item.vod_play_from ?? '')
        const urlGroups = playUrlRaw.split('$$$')
        const nameGroups = playFromRaw.split('$$$')

        const groupResults: Array<{ siteId: string; siteName: string; sourceGroup: string; url: string }> = []

        for (let g = 0; g < urlGroups.length; g++) {
          const groupContent = urlGroups[g] ?? ''
          const groupName = (nameGroups[g] ?? `源${g + 1}`).trim()
          const pairs = groupContent.split('#').filter(Boolean)

          let m3u8Url = ''
          for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i]
            const dollarIdx = pair.indexOf('$')
            if (dollarIdx === -1) continue
            const epUrl = pair.substring(dollarIdx + 1).trim()
            if (epUrl.includes('.m3u8')) {
              if (i === episodeIndex) { m3u8Url = epUrl; break }
              if (!m3u8Url) m3u8Url = epUrl
            }
          }

          if (m3u8Url) {
            groupResults.push({ siteId: cms.id, siteName: cms.name, sourceGroup: groupName, url: m3u8Url })
          }
        }

        return groupResults.length > 0 ? groupResults : null
      } catch {
        return null
      }
    })
  )

  const allSources = results
    .filter(r => r.status === 'fulfilled' && r.value)
    .flatMap(r => r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : [r.value]) : [])
    .filter(Boolean)

  console.log(`[sources-all] videoId=${videoId}, exclude=${excludeSite}, found=${allSources.length} sources`)
  res.json({ success: true, sources: allSources })
})

/** 调试：测试代理是否可达 */
router.get('/debug/proxy-test', async (req, res) => {
  const url = String(req.query.url ?? '')
  if (!url) { res.json({ error: 'missing url' }); return }
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    })
    res.json({ status: r.status, contentType: r.headers.get('content-type'), ok: r.ok })
  } catch (err) {
    res.json({ error: String(err) })
  }
})

export default router
