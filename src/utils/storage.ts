import type { PlaybackRate, Theme } from '../types/video'

const STORAGE_KEYS = {
  PREFERENCES: 'video-player-prefs',
  URL_HISTORY: 'video-player-url-history',
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
}
