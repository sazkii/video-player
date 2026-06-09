/**
 * 从环境变量读取 CMS 数据源配置
 * 格式: CMS_SOURCE_名称=id|名称|API地址
 */
export interface CmsSourceConfig {
  id: string
  name: string
  cmsApiUrl: string
}

export function getCmsSourcesFromEnv(): CmsSourceConfig[] {
  const sources: CmsSourceConfig[] = []

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('CMS_SOURCE_') || !value) continue

    const parts = value.split('|')
    if (parts.length !== 3) {
      console.warn(`[Config] 忽略无效的 CMS_SOURCE 配置: ${key}=${value}`)
      continue
    }

    const [id, name, cmsApiUrl] = parts
    if (!id || !name || !cmsApiUrl) {
      console.warn(`[Config] 忽略不完整的 CMS_SOURCE 配置: ${key}=${value}`)
      continue
    }

    sources.push({ id, name, cmsApiUrl })
  }

  return sources
}
