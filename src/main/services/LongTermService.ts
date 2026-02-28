import { db } from '../db'
import { randomUUID } from 'crypto'

export class LongTermService {
  static async getGoals() {
    const goals = db.prepare('SELECT * FROM LongTermGoal ORDER BY createdAt DESC').all() as any[]
    const subtasks = db.prepare('SELECT * FROM RecurringTask ORDER BY createdAt DESC').all() as any[]

    return goals.map(g => ({
      ...g,
      createdAt: new Date(g.createdAt),
      subtasks: subtasks
        .filter(s => s.longTermGoalId === g.id)
        .map(s => ({
          ...s,
          createdAt: new Date(s.createdAt)
        }))
    }))
  }

  static async createGoal(content: string) {
    const id = randomUUID()
    const now = Date.now()
    
    const goal = {
      id,
      content,
      status: 'PENDING',
      createdAt: now
    }

    db.prepare(`
      INSERT INTO LongTermGoal (id, content, status, createdAt)
      VALUES (@id, @content, @status, @createdAt)
    `).run(goal)

    return {
      ...goal,
      createdAt: new Date(goal.createdAt),
      subtasks: []
    }
  }

  static async updateStatus(id: string, status: string) {
    db.prepare('UPDATE LongTermGoal SET status = ? WHERE id = ?').run(status, id)
    
    const goal = db.prepare('SELECT * FROM LongTermGoal WHERE id = ?').get(id) as any
    return {
      ...goal,
      createdAt: new Date(goal.createdAt)
    }
  }

  static async deleteGoal(id: string) {
    const goal = db.prepare('SELECT * FROM LongTermGoal WHERE id = ?').get(id) as any
    if (!goal) return null

    db.prepare('DELETE FROM LongTermGoal WHERE id = ?').run(id)

    return {
      ...goal,
      createdAt: new Date(goal.createdAt)
    }
  }

  static async createSubtask(longTermId: string, content: string) {
    const recurringId = randomUUID()
    const dailyId = randomUUID()
    const now = Date.now()

    const recurringTask = {
      id: recurringId,
      content,
      longTermGoalId: longTermId,
      createdAt: now
    }

    const dailyTask = {
      id: dailyId,
      content,
      status: 'PENDING',
      type: 'TODAY',
      recurringTaskId: recurringId,
      isPersist: 0,
      createdAt: now,
      updatedAt: now,
      longTermId: null,
      planDate: null
    }

    const transaction = db.transaction(() => {
      // 1. Create the recurring task definition
      db.prepare(`
        INSERT INTO RecurringTask (id, content, longTermGoalId, createdAt)
        VALUES (@id, @content, @longTermGoalId, @createdAt)
      `).run(recurringTask)

      // 2. Immediately create a daily task for today
      db.prepare(`
        INSERT INTO DailyTask (id, content, status, type, recurringTaskId, isPersist, createdAt, updatedAt)
        VALUES (@id, @content, @status, @type, @recurringTaskId, @isPersist, @createdAt, @updatedAt)
      `).run(dailyTask)
    })

    transaction()

    return {
      ...recurringTask,
      createdAt: new Date(recurringTask.createdAt)
    }
  }

  static async deleteSubtask(id: string) {
    const subtask = db.prepare('SELECT * FROM RecurringTask WHERE id = ?').get(id) as any
    if (!subtask) return null

    db.prepare('DELETE FROM RecurringTask WHERE id = ?').run(id)

    return {
      ...subtask,
      createdAt: new Date(subtask.createdAt)
    }
  }
}
