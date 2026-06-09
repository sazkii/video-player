import type { SiteAdapter } from './types.js'

/** 适配器注册表 */
const adapters = new Map<string, SiteAdapter>()

/** 注册适配器 */
export function registerAdapter(adapter: SiteAdapter): void {
  adapters.set(adapter.id, adapter)
}

/** 获取适配器 */
export function getAdapter(id: string): SiteAdapter | undefined {
  return adapters.get(id)
}

/** 获取所有已启用的适配器 */
export function getEnabledAdapters(): SiteAdapter[] {
  return Array.from(adapters.values()).filter(a => a.enabled)
}

/** 获取所有适配器（含禁用的） */
export function getAllAdapters(): SiteAdapter[] {
  return Array.from(adapters.values())
}

/** 切换适配器启用状态 */
export function toggleAdapter(id: string, enabled: boolean): boolean {
  const adapter = adapters.get(id)
  if (!adapter) return false
  adapter.enabled = enabled
  return true
}
