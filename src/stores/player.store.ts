import { create } from 'zustand'
import type { PlaySource, BackupSource } from '@/schemas/video'

interface PlayerState {
  /** 当前播放源 */
  currentSource: PlaySource | null
  /** 备用数据源列表 */
  backupSources: BackupSource[]
  /** 当前活跃数据源名称 */
  activeSourceName: string
  /** 所有可用源组 */
  sourceGroups: string[]
  /** 当前源组 */
  currentGroup: string
  /** 获取播放源加载状态 */
  sourcesLoading: boolean
  /** 备用源是否已加载完成 */
  backupsLoaded: boolean
  /** 备用源索引 */
  backupIndex: number

  /** 设置播放源 */
  setSource: (source: PlaySource | null) => void
  /** 设置活跃源名称 */
  setActiveSourceName: (name: string) => void
  /** 添加备用数据源 */
  setBackupSources: (sources: BackupSource[]) => void
  /** 设置源组列表 */
  setSourceGroups: (groups: string[]) => void
  /** 切换源组 */
  setCurrentGroup: (group: string) => void
  /** 设置加载状态 */
  setSourcesLoading: (loading: boolean) => void
  /** 尝试下一个备用源 */
  tryNextBackup: () => BackupSource | null
  /** 重置状态（换集时） */
  reset: () => void
}

const initialState = {
  currentSource: null as PlaySource | null,
  backupSources: [] as BackupSource[],
  activeSourceName: '',
  sourceGroups: [] as string[],
  currentGroup: '',
  sourcesLoading: true,
  backupsLoaded: false,
  backupIndex: 0,
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...initialState,

  setSource: (source) => set({ currentSource: source }),
  setActiveSourceName: (name) => set({ activeSourceName: name }),
  setBackupSources: (sources) => set({ backupSources: sources, backupsLoaded: true }),
  setSourceGroups: (groups) => set({ sourceGroups: groups }),
  setCurrentGroup: (group) => set({ currentGroup: group }),
  setSourcesLoading: (loading) => set({ sourcesLoading: loading }),

  tryNextBackup: () => {
    const state = get()
    const idx = state.backupIndex
    if (idx < state.backupSources.length) {
      const next = state.backupSources[idx]
      if (next) {
        set({ backupIndex: idx + 1, activeSourceName: next.siteName })
        return next
      }
    }
    return null
  },

  reset: () => set({ ...initialState }),
}))
