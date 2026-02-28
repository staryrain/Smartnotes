import { create } from 'zustand'

export type Tab = 'tasks' | 'plan' | 'longterm' | 'achievements' | 'settings'

interface Store {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  
  tasks: any[]
  fetchTasks: () => Promise<void>
  deleteTaskOptimistic: (id: string) => Promise<void>
  
  plans: any[]
  fetchPlans: () => Promise<void>
  deletePlanOptimistic: (id: string) => Promise<void>
  
  longTerms: any[]
  fetchLongTerms: () => Promise<void>
  deleteLongTermOptimistic: (id: string) => Promise<void>
  deleteLongTermSubtaskOptimistic: (id: string) => Promise<void>
  
  achievements: any[]
  fetchAchievements: () => Promise<void>
  deleteAchievementOptimistic: (id: string) => Promise<void>
  
  opacity: number
  setOpacity: (val: number) => void

  isPenetrate: boolean
  togglePenetrate: () => void

  hoveringCount: number
  setHovering: (isEnter: boolean) => void
}

export const useStore = create<Store>((set, get) => ({
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
  deleteTaskOptimistic: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
    try {
      await window.api.deleteTask(id)
    } catch (e) {
      console.error(e)
      get().fetchTasks()
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
  deletePlanOptimistic: async (id) => {
    set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }))
    try {
      await window.api.deletePlan(id)
    } catch (e) {
      console.error(e)
      get().fetchPlans()
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
  deleteLongTermOptimistic: async (id) => {
    set((state) => ({ longTerms: state.longTerms.filter((lt) => lt.id !== id) }))
    try {
      await window.api.deleteLongTerm(id)
    } catch (e) {
      console.error(e)
      get().fetchLongTerms()
    }
  },
  deleteLongTermSubtaskOptimistic: async (id) => {
    set((state) => ({
      longTerms: state.longTerms.map((lt) => ({
        ...lt,
        subtasks: lt.subtasks ? lt.subtasks.filter((st: any) => st.id !== id) : [],
      })),
    }))
    try {
      await window.api.deleteLongTermSubtask(id)
    } catch (e) {
      console.error(e)
      get().fetchLongTerms()
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
  deleteAchievementOptimistic: async (id) => {
    set((state) => ({ achievements: state.achievements.filter((a) => a.id !== id) }))
    try {
      await window.api.deleteAchievement(id)
    } catch (e) {
      console.error(e)
      get().fetchAchievements()
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
  })
}))
