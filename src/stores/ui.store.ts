import { create } from 'zustand'

interface UIState {
  /** 侧边栏是否展开 */
  sidebarExpanded: boolean
  /** 是否为移动端 */
  isMobile: boolean
  /** 切换侧边栏 */
  toggleSidebar: () => void
  /** 设置移动端状态 */
  setMobile: (isMobile: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarExpanded: true,
  isMobile: false,
  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
  setMobile: (isMobile) => set({ isMobile }),
}))
