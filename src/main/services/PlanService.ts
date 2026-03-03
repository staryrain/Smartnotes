import { db } from '../db'
import { randomUUID } from 'crypto'

export class PlanService {
  static async getPlans() {
    const tasks = db.prepare(`
      SELECT * FROM DailyTask
      WHERE type = 'PLAN_TOMORROW'
      ORDER BY 
        isCustomTime DESC,
        CASE WHEN isCustomTime = 1 THEN planDate END ASC,
        createdAt DESC
    `).all() as any[]

    return tasks.map(t => ({
      ...t,
      isPersist: Boolean(t.isPersist),
      isCustomTime: Boolean(t.isCustomTime),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      planDate: t.planDate ? new Date(t.planDate) : null
    }))
  }

  static async createPlan(content: string) {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(6, 0, 0, 0)
    
    const id = randomUUID()
    const nowTs = Date.now()
    
    const task = {
      id,
      content,
      status: 'PENDING',
      type: 'PLAN_TOMORROW',
      planDate: tomorrow.getTime(),
      isPersist: 0,
      isCustomTime: 0,
      createdAt: nowTs,
      updatedAt: nowTs,
      longTermId: null,
      recurringTaskId: null
    }

    const stmt = db.prepare(`
      INSERT INTO DailyTask (id, content, status, type, planDate, isPersist, isCustomTime, createdAt, updatedAt)
      VALUES (@id, @content, @status, @type, @planDate, @isPersist, @isCustomTime, @createdAt, @updatedAt)
    `)
    
    stmt.run(task)

    return {
      ...task,
      isPersist: Boolean(task.isPersist),
      isCustomTime: Boolean(task.isCustomTime),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      planDate: new Date(task.planDate)
    }
  }

  static async deletePlan(id: string) {
    const task = db.prepare('SELECT * FROM DailyTask WHERE id = ?').get(id) as any
    if (!task) return null

    db.prepare('DELETE FROM DailyTask WHERE id = ?').run(id)

    return {
      ...task,
      isPersist: Boolean(task.isPersist),
      isCustomTime: Boolean(task.isCustomTime),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      planDate: task.planDate ? new Date(task.planDate) : null
    }
  }

  static async updateContent(id: string, content: string) {
    const now = Date.now()
    const stmt = db.prepare(`
      UPDATE DailyTask
      SET content = @content, updatedAt = @updatedAt
      WHERE id = @id
    `)
    stmt.run({ id, content, updatedAt: now })
    
    const task = db.prepare('SELECT * FROM DailyTask WHERE id = ?').get(id) as any
    return {
      ...task,
      isPersist: Boolean(task.isPersist),
      isCustomTime: Boolean(task.isCustomTime),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      planDate: task.planDate ? new Date(task.planDate) : null
    }
  }

  static async updatePlanTime(id: string, planDate: number | null, isCustomTime: boolean) {
    const now = Date.now()
    let newPlanDate = planDate

    if (!isCustomTime) {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      d.setHours(6, 0, 0, 0)
      newPlanDate = d.getTime()
    }

    const stmt = db.prepare(`
      UPDATE DailyTask
      SET planDate = ?, isCustomTime = ?, updatedAt = ?
      WHERE id = ?
    `)
    
    const result = stmt.run(newPlanDate, isCustomTime ? 1 : 0, now, id)
    
    if (result.changes === 0) return null
    
    const task = db.prepare('SELECT * FROM DailyTask WHERE id = ?').get(id) as any
    return {
      ...task,
      isPersist: Boolean(task.isPersist),
      isCustomTime: Boolean(task.isCustomTime),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      planDate: task.planDate ? new Date(task.planDate) : null
    }
  }

  static async checkAndMovePlans() {
    const now = Date.now()
    
    // Move plans that are due
    const result = db.prepare(`
      UPDATE DailyTask
      SET type = 'TODAY', planDate = NULL, updatedAt = ?, createdAt = ?
      WHERE type = 'PLAN_TOMORROW'
      AND planDate <= ?
    `).run(now, now, now)

    return result.changes > 0
  }
}
