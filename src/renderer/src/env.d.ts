/// <reference types="vite/client" />

interface Window {
  api: {
    getTasks: () => Promise<any[]>
    createTask: (content: string, longTermId?: string) => Promise<any>
    updateTaskStatus: (id: string, status: string) => Promise<any>
    updateTaskPersist: (id: string, isPersist: boolean) => Promise<any>
    deleteTask: (id: string) => Promise<any>
    
    getPlans: () => Promise<any[]>
    createPlan: (content: string) => Promise<any>
    deletePlan: (id: string) => Promise<any>
    
    getLongTerms: () => Promise<any[]>
    createLongTerm: (content: string) => Promise<any>
    updateLongTermStatus: (id: string, status: string) => Promise<any>
    deleteLongTerm: (id: string) => Promise<any>
    createLongTermSubtask: (longTermId: string, content: string) => Promise<any>
    deleteLongTermSubtask: (id: string) => Promise<any>
    
    getAchievements: () => Promise<any[]>
    createAchievement: (content: string, year: number, month: number) => Promise<any>
    deleteAchievement: (id: string) => Promise<any>
    
    setIgnoreMouseEvents: (ignore: boolean) => Promise<void>
    minimizeToTray: () => Promise<void>
    setOpacity: (opacity: number) => Promise<void>
  }
}
