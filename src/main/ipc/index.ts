import { ipcMain } from 'electron'
import { TaskService } from '../services/TaskService'
import { PlanService } from '../services/PlanService'
import { LongTermService } from '../services/LongTermService'
import { AchievementService } from '../services/AchievementService'

// Helper wrapper for error handling
const handle = (channel: string, handler: (...args: any[]) => Promise<any>) => {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      return await handler(event, ...args)
    } catch (error) {
      console.error(`Error in IPC channel ${channel}:`, error)
      throw error // Re-throw so renderer receives the error
    }
  })
}

export function setupIPC() {
  // Tasks
  handle('task:get', () => TaskService.getTasks())
  handle('task:create', (_, content, longTermId) => TaskService.createTask(content, longTermId))
  handle('task:updateStatus', (_, id, status) => TaskService.updateStatus(id, status))
  handle('task:updatePersist', (_, id, isPersist) => TaskService.updatePersist(id, isPersist))
  handle('task:updatePin', (_, id, isPinned) => TaskService.updatePin(id, isPinned))
  handle('task:reorder', (_, ids) => TaskService.reorderTasks(ids))
  handle('task:delete', (_, id) => TaskService.deleteTask(id))

  // Plans
  handle('plan:get', () => PlanService.getPlans())
  handle('plan:create', (_, content) => PlanService.createPlan(content))
  handle('plan:delete', (_, id) => PlanService.deletePlan(id))
  handle('plan:updateTime', (_, id, planDate, isCustomTime) => PlanService.updatePlanTime(id, planDate, isCustomTime))
  
  // Long Term
  handle('longterm:get', () => LongTermService.getGoals())
  handle('longterm:create', (_, content) => LongTermService.createGoal(content))
  handle('longterm:updateStatus', (_, id, status) => LongTermService.updateStatus(id, status))
  handle('longterm:delete', (_, id) => LongTermService.deleteGoal(id))
  handle('longterm:createSubtask', (_, longTermId, content) => LongTermService.createSubtask(longTermId, content))
  handle('longterm:deleteSubtask', (_, id) => LongTermService.deleteSubtask(id))

  // Achievements
  handle('achievement:get', () => AchievementService.getAchievements())
  handle('achievement:create', (_, content, year, month) => AchievementService.createAchievement(content, year, month))
  handle('achievement:delete', (_, id) => AchievementService.deleteAchievement(id))
}
