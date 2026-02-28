import { db } from '../db'
import { randomUUID } from 'crypto'

export class AchievementService {
  static async getAchievements() {
    const achievements = db.prepare(`
      SELECT * FROM Achievement
      ORDER BY year DESC, month DESC, createdAt DESC
    `).all() as any[]

    return achievements.map(a => ({
      ...a,
      createdAt: new Date(a.createdAt)
    }))
  }

  static async createAchievement(content: string, year: number, month: number) {
    const now = new Date()
    // format "10号 19点"
    const recordTime = `${now.getDate()}号 ${now.getHours()}点`
    const id = randomUUID()
    const nowTs = Date.now()

    const achievement = {
      id,
      content,
      year,
      month,
      recordTime,
      createdAt: nowTs
    }

    db.prepare(`
      INSERT INTO Achievement (id, content, year, month, recordTime, createdAt)
      VALUES (@id, @content, @year, @month, @recordTime, @createdAt)
    `).run(achievement)

    return {
      ...achievement,
      createdAt: new Date(achievement.createdAt)
    }
  }

  static async deleteAchievement(id: string) {
    const achievement = db.prepare('SELECT * FROM Achievement WHERE id = ?').get(id) as any
    if (!achievement) return null

    db.prepare('DELETE FROM Achievement WHERE id = ?').run(id)

    return {
      ...achievement,
      createdAt: new Date(achievement.createdAt)
    }
  }
}
