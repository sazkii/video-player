import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2
type Theme = 'dark' | 'light'

interface PreferencesState {
  /** 音量 */
  volume: number
  /** 播放速度 */
  playbackRate: PlaybackRate
  /** 主题 */
  theme: Theme
  /** 设置音量 */
  setVolume: (volume: number) => void
  /** 设置播放速度 */
  setPlaybackRate: (rate: PlaybackRate) => void
  /** 设置主题 */
  setTheme: (theme: Theme) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      volume: 1,
      playbackRate: 1,
      theme: 'dark',
      setVolume: (volume) => set({ volume }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'cinemaflow-preferences' }
  )
)
