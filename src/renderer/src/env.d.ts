/// <reference types="vite/client" />

interface Window {
  api: {
    getTasks: () => Promise<any[]>
    createTask: (content: string, longTermId?: string) => Promise<any>
    updateTaskStatus: (id: string, status: string) => Promise<any>
    updateTaskContent: (id: string, content: string) => Promise<any>
    updateTaskPersist: (id: string, isPersist: boolean) => Promise<any>
    updateTaskPin: (id: string, isPinned: boolean) => Promise<any>
    reorderTasks: (ids: string[]) => Promise<any>
    deleteTask: (id: string) => Promise<any>
    
    getPlans: () => Promise<any[]>
    createPlan: (content: string) => Promise<any>
    deletePlan: (id: string) => Promise<any>
    updatePlanTime: (id: string, planDate: number | null, isCustomTime: boolean) => Promise<any>
    updatePlanContent: (id: string, content: string) => Promise<any>
    
    getLongTerms: () => Promise<any[]>
    createLongTerm: (content: string) => Promise<any>
    updateLongTermStatus: (id: string, status: string) => Promise<any>
    updateLongTermContent: (id: string, content: string) => Promise<any>
    deleteLongTerm: (id: string) => Promise<any>
    createLongTermSubtask: (longTermId: string, content: string) => Promise<any>
    deleteLongTermSubtask: (id: string) => Promise<any>
    updateLongTermSubtaskContent: (id: string, content: string) => Promise<any>
    
    getAchievements: () => Promise<any[]>
    createAchievement: (content: string, year: number, month: number) => Promise<any>
    updateAchievement: (id: string, content: string) => Promise<any>
    deleteAchievement: (id: string) => Promise<any>
    
    setIgnoreMouseEvents: (ignore: boolean) => Promise<void>
    minimizeToTray: () => Promise<void>
    setOpacity: (opacity: number) => Promise<void>
    setSkipTaskbar: (skip: boolean) => Promise<void>
    setAutoLaunch: (enable: boolean) => Promise<void>
    getAutoLaunch: () => Promise<boolean>
    
    onDataUpdated: (callback: () => void) => () => void
  }
}
