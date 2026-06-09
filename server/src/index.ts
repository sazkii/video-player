import app from './app.js'
import { initDB, queryAll } from './db/index.js'
import { registerAdapter } from './adapters/registry.js'
import { GenericCollectorAdapter } from './adapters/generic-collector.js'
import { LziApiCmsAdapter } from './adapters/lziapi-cms.js'
import os from 'os'

const PORT = Number(process.env.PORT ?? 3000)

async function main() {
  // 初始化数据库
  await initDB()
  console.log('[DB] SQLite 数据库已初始化')

  // 从数据库加载站点配置并注册
  try {
    const sites = queryAll<{ id: string; name: string; enabled: number; config: string | null }>(
      'SELECT * FROM sites'
    )
    for (const site of sites) {
      const config = site.config ? JSON.parse(site.config) : {}
      const adapter = new GenericCollectorAdapter({
        id: site.id,
        name: site.name,
        enabled: !!site.enabled,
        ...config,
      })
      registerAdapter(adapter)
    }
    console.log(`[Adapters] 已加载 ${sites.length} 个站点配置`)
  } catch {
    // 首次运行
  }

  // 内置 CMS API 适配器列表
  const BUILTIN_CMS_SOURCES: Array<{ id: string; name: string; cmsApiUrl: string }> = [
    { id: 'lziapi', name: '量子资源', cmsApiUrl: 'https://cj.lziapi.com/api.php/provide/vod' },
    { id: 'guangsuapi', name: '光速资源', cmsApiUrl: 'https://api.guangsuapi.com/api.php/provide/vod' },
    { id: 'sdzyapi', name: '闪电资源', cmsApiUrl: 'https://sdzyapi.com/api.php/provide/vod' },
    { id: 'hongniuzy2', name: '红牛资源', cmsApiUrl: 'https://www.hongniuzy2.com/api.php/provide/vod' },
    { id: 'heiycloud', name: '非凡资源', cmsApiUrl: 'https://heiycloud.com/api.php/provide/vod' },
    { id: 'tiankongapi', name: '天空资源', cmsApiUrl: 'https://m3u8.tiankongapi.com/api.php/provide/vod' },
  ]

  for (const source of BUILTIN_CMS_SOURCES) {
    registerAdapter(new LziApiCmsAdapter({ ...source, enabled: true }))
  }
  console.log(`[Adapters] 已注册 ${BUILTIN_CMS_SOURCES.length} 个内置 CMS 数据源`)

  // 启动服务器
  app.listen(PORT, '0.0.0.0', () => {
    const nets = Object.values(os.networkInterfaces())
      .flat()
      .filter(n => n?.family === 'IPv4' && !n.internal)
      .map(n => n?.address)
    console.log(`\n🎬 Video Player Server 已启动`)
    console.log(`   本地: http://localhost:${PORT}`)
    if (nets.length > 0) {
      console.log(`   局域网: http://${nets[0]}:${PORT}`)
    }
    console.log(`\n   API 接口:`)
    console.log(`   GET  /api/search?q=关键词     搜索`)
    console.log(`   GET  /api/search/detail?url=   详情`)
    console.log(`   GET  /api/search/sources?url=  播放源`)
    console.log(`   GET  /api/proxy?url=           视频代理`)
    console.log(`   GET  /api/user/favorites       收藏列表`)
    console.log(`   GET  /api/user/history         观看历史`)
    console.log(`   GET  /api/sites                站点列表`)
    console.log('')
  })
}

main().catch(err => {
  console.error('启动失败:', err)
  process.exit(1)
})
