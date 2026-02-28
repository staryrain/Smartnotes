import { create } from 'zustand'

export type Tab = 'tasks' | 'plan' | 'longterm' | 'achievements' | 'settings'

interface Store {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  
  tasks: any[]
  fetchTasks: () => Promise<void>
  
  plans: any[]
  fetchPlans: () => Promise<void>
  
  longTerms: any[]
  fetchLongTerms: () => Promise<void>
  
  achievements: any[]
  fetchAchievements: () => Promise<void>
  
  opacity: number
  setOpacity: (val: number) => void

  isPenetrate: boolean
  togglePenetrate: () => void

  hoveringCount: number
  setHovering: (isEnter: boolean) => void

  isSkipTaskbar: boolean
  setSkipTaskbar: (val: boolean) => void
  isAutoLaunch: boolean
  setAutoLaunch: (val: boolean) => void
  checkAutoLaunch: () => Promise<void>
}

export const useStore = create<Store>((set) => ({
  activeTab: 'tasks',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  tasks: [],
  fetchTasks: async () => {
    try {
      const tasks = await window.api.getTasks()
      set({ tasks })
    } catch (e) {
      console.error(e)
    }
  },
  
  plans: [],
  fetchPlans: async () => {
    try {
      const plans = await window.api.getPlans()
      set({ plans })
    } catch (e) {
      console.error(e)
    }
  },
  
  longTerms: [],
  fetchLongTerms: async () => {
    try {
      const longTerms = await window.api.getLongTerms()
      set({ longTerms })
    } catch (e) {
      console.error(e)
    }
  },
  
  achievements: [],
  fetchAchievements: async () => {
    try {
      const achievements = await window.api.getAchievements()
      set({ achievements })
    } catch (e) {
      console.error(e)
    }
  },
  
  opacity: 0.9,
  setOpacity: (val) => {
    set({ opacity: val })
    window.api.setOpacity(val)
  },

  isPenetrate: false,
  togglePenetrate: () => set((state) => {
    const newState = !state.isPenetrate
    const shouldIgnore = newState && state.hoveringCount === 0
    window.api.setIgnoreMouseEvents(shouldIgnore)
    return { isPenetrate: newState }
  }),

  hoveringCount: 0,
  setHovering: (isEnter) => set((state) => {
    const newCount = Math.max(0, state.hoveringCount + (isEnter ? 1 : -1))
    if (state.isPenetrate) {
      window.api.setIgnoreMouseEvents(newCount === 0)
    }
    return { hoveringCount: newCount }
  }),

  isSkipTaskbar: false,
  setSkipTaskbar: (val) => {
    set({ isSkipTaskbar: val })
    window.api.setSkipTaskbar(val)
  },

  isAutoLaunch: false,
  setAutoLaunch: (val) => {
    set({ isAutoLaunch: val })
    window.api.setAutoLaunch(val)
  },
  
  checkAutoLaunch: async () => {
    try {
      const isAutoLaunch = await window.api.getAutoLaunch()
      set({ isAutoLaunch })
    } catch (e) {
      console.error(e)
    }
  }
}))
