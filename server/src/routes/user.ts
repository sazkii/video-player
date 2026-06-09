import { Router } from 'express'
import { queryAll, execute } from '../db/index.js'

const router = Router()

/** 获取收藏列表 */
router.get('/favorites', (_req, res) => {
  const favorites = queryAll(
    'SELECT * FROM favorites ORDER BY created_at DESC'
  )
  res.json({ success: true, favorites })
})

/** 添加收藏 */
router.post('/favorites', (req, res) => {
  const { site_id, title, url, poster, year, genre, description } = req.body

  if (!site_id || !title || !url) {
    res.json({ success: false, error: '缺少必要字段' })
    return
  }

  try {
    execute(
      `INSERT OR IGNORE INTO favorites (site_id, title, url, poster, year, genre, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [site_id, title, url, poster ?? null, year ?? null, genre ?? null, description ?? null]
    )
    res.json({ success: true })
  } catch (err) {
    console.error('添加收藏失败:', err)
    res.json({ success: false, error: '添加收藏失败' })
  }
})

/** 删除收藏 */
router.delete('/favorites', (req, res) => {
  const url = String(req.query.url ?? '')
  if (!url) {
    res.json({ success: false, error: 'URL 不能为空' })
    return
  }
  execute('DELETE FROM favorites WHERE url = ?', [url])
  res.json({ success: true })
})

/** 获取观看历史 */
router.get('/history', (_req, res) => {
  const history = queryAll(
    'SELECT * FROM history ORDER BY updated_at DESC LIMIT 50'
  )
  res.json({ success: true, history })
})

/** 更新观看记录 */
router.post('/history', (req, res) => {
  const { site_id, title, url, poster, episode_name, episode_url, current_time, duration } =
    req.body

  if (!site_id || !url) {
    res.json({ success: false, error: '缺少必要字段' })
    return
  }

  try {
    execute(
      `INSERT INTO history (site_id, title, url, poster, episode_name, episode_url, current_time, duration, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(site_id, url, episode_url) DO UPDATE SET
         current_time = excluded.current_time,
         duration = excluded.duration,
         episode_name = excluded.episode_name,
         updated_at = CURRENT_TIMESTAMP`,
      [
        site_id,
        title ?? '',
        url,
        poster ?? null,
        episode_name ?? null,
        episode_url ?? null,
        current_time ?? 0,
        duration ?? 0,
      ]
    )
    res.json({ success: true })
  } catch (err) {
    console.error('更新观看记录失败:', err)
    res.json({ success: false, error: '更新观看记录失败' })
  }
})

/** 删除观看记录 */
router.delete('/history', (req, res) => {
  const url = String(req.query.url ?? '')
  if (!url) {
    execute('DELETE FROM history', [])
  } else {
    execute('DELETE FROM history WHERE url = ?', [url])
  }
  res.json({ success: true })
})

export default router
