import app from './app.js'
import { initDB, queryAll } from './db/index.js'
import { registerAdapter } from './adapters/registry.js'
import { GenericCollectorAdapter } from './adapters/generic-collector.js'
import { LziApiCmsAdapter } from './adapters/lziapi-cms.js'
import { getCmsSourcesFromEnv } from './config.js'
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

  // 从环境变量加载 CMS 数据源
  const builtinSources = getCmsSourcesFromEnv()
  for (const source of builtinSources) {
    registerAdapter(new LziApiCmsAdapter({ ...source, enabled: true }))
  }
  if (builtinSources.length > 0) {
    console.log(`[Adapters] 已注册 ${builtinSources.length} 个内置 CMS 数据源`)
  } else {
    console.log('[Adapters] 未配置内置 CMS 数据源（参考 server/.env.example）')
  }

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
