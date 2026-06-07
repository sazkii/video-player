import type { PlaybackRate, Theme, DataSource } from '../types/video'

const STORAGE_KEYS = {
  PREFERENCES: 'video-player-prefs',
  URL_HISTORY: 'video-player-url-history',
  DATA_SOURCES: 'video-player-data-sources',
} as const

interface StoredPreferences {
  theme: Theme
  volume: number
  playbackRate: PlaybackRate
}

const DEFAULT_PREFS: StoredPreferences = {
  theme: 'dark',
  volume: 1,
  playbackRate: 1,
}

const MAX_URL_HISTORY = 20

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage 满或不可用时静默失败
  }
}

export const storage = {
  /** 获取用户偏好 */
  getPreferences(): StoredPreferences {
    return safeGet(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFS)
  },

  /** 保存用户偏好 */
  savePreferences(prefs: Partial<StoredPreferences>): void {
    const current = storage.getPreferences()
    safeSet(STORAGE_KEYS.PREFERENCES, { ...current, ...prefs })
  },

  /** 获取URL历史 */
  getURLHistory(): string[] {
    return safeGet<string[]>(STORAGE_KEYS.URL_HISTORY, [])
  },

  /** 添加URL到历史（去重，最多20条） */
  addURLToHistory(url: string): void {
    const history = storage.getURLHistory().filter(u => u !== url)
    history.unshift(url)
    safeSet(STORAGE_KEYS.URL_HISTORY, history.slice(0, MAX_URL_HISTORY))
  },

  /** 清除URL历史 */
  clearURLHistory(): void {
    safeSet(STORAGE_KEYS.URL_HISTORY, [])
  },

  /** ─── 数据源管理 ──────────────────────────────────────────────────────── */

  /** 获取用户自定义数据源列表 */
  getDataSources(): DataSource[] {
    return safeGet<DataSource[]>(STORAGE_KEYS.DATA_SOURCES, [])
  },

  /** 添加自定义数据源 */
  addDataSource(source: DataSource): void {
    const sources = storage.getDataSources()
    // 按 id 去重
    if (sources.some(s => s.id === source.id)) return
    sources.push(source)
    safeSet(STORAGE_KEYS.DATA_SOURCES, sources)
  },

  /** 更新数据源（按 id） */
  updateDataSource(id: string, updates: Partial<DataSource>): void {
    const sources = storage.getDataSources()
    const idx = sources.findIndex(s => s.id === id)
    if (idx === -1) return
    const existing = sources[idx]!
    sources[idx] = {
      id,
      name: updates.name ?? existing.name,
      url: updates.url ?? existing.url,
      category: updates.category ?? existing.category,
      format: updates.format ?? existing.format,
      description: updates.description ?? existing.description,
      resolution: updates.resolution ?? existing.resolution,
    }
    safeSet(STORAGE_KEYS.DATA_SOURCES, sources)
  },

  /** 删除数据源（按 id） */
  removeDataSource(id: string): void {
    const sources = storage.getDataSources().filter(s => s.id !== id)
    safeSet(STORAGE_KEYS.DATA_SOURCES, sources)
  },

  /** 清除所有自定义数据源 */
  clearDataSources(): void {
    safeSet(STORAGE_KEYS.DATA_SOURCES, [])
  },

  /** 合并预设 + 自定义数据源（自定义在前，便于浏览） */
  getAllDataSources(presets: DataSource[]): DataSource[] {
    return [...storage.getDataSources(), ...presets]
  },
}
