import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  // Task
  getTasks: () => ipcRenderer.invoke('task:get'),
  createTask: (content: string, longTermId?: string) => ipcRenderer.invoke('task:create', content, longTermId),
  updateTaskStatus: (id: string, status: string) => ipcRenderer.invoke('task:updateStatus', id, status),
  updateTaskPersist: (id: string, isPersist: boolean) => ipcRenderer.invoke('task:updatePersist', id, isPersist),
  updateTaskPin: (id: string, isPinned: boolean) => ipcRenderer.invoke('task:updatePin', id, isPinned),
  deleteTask: (id: string) => ipcRenderer.invoke('task:delete', id),

  // Plan
  getPlans: () => ipcRenderer.invoke('plan:get'),
  createPlan: (content: string) => ipcRenderer.invoke('plan:create', content),
  deletePlan: (id: string) => ipcRenderer.invoke('plan:delete', id),

  // Long Term
  getLongTerms: () => ipcRenderer.invoke('longterm:get'),
  createLongTerm: (content: string) => ipcRenderer.invoke('longterm:create', content),
  updateLongTermStatus: (id: string, status: string) => ipcRenderer.invoke('longterm:updateStatus', id, status),
  deleteLongTerm: (id: string) => ipcRenderer.invoke('longterm:delete', id),
  createLongTermSubtask: (longTermId: string, content: string) => ipcRenderer.invoke('longterm:createSubtask', longTermId, content),
  deleteLongTermSubtask: (id: string) => ipcRenderer.invoke('longterm:deleteSubtask', id),

  // Achievement
  getAchievements: () => ipcRenderer.invoke('achievement:get'),
  createAchievement: (content: string, year: number, month: number) => ipcRenderer.invoke('achievement:create', content, year, month),
  deleteAchievement: (id: string) => ipcRenderer.invoke('achievement:delete', id),

  // Window controls
  setIgnoreMouseEvents: (ignore: boolean) => ipcRenderer.invoke('window:setIgnoreMouseEvents', ignore),
  minimizeToTray: () => ipcRenderer.invoke('window:minimizeToTray'),
  setOpacity: (opacity: number) => ipcRenderer.invoke('window:setOpacity', opacity),
  setSkipTaskbar: (skip: boolean) => ipcRenderer.invoke('window:setSkipTaskbar', skip),
  setAutoLaunch: (enable: boolean) => ipcRenderer.invoke('window:setAutoLaunch', enable),
  getAutoLaunch: () => ipcRenderer.invoke('window:getAutoLaunch'),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
