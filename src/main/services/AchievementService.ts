import { prisma } from '../db'

export class AchievementService {
  static async getAchievements() {
    return prisma.achievement.findMany({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { createdAt: 'desc' }
      ]
    })
  }

  static async createAchievement(content: string, year: number, month: number) {
    const now = new Date()
    // format "10号 19点"
    const recordTime = `${now.getDate()}号 ${now.getHours()}点`

    return prisma.achievement.create({
      data: {
        content,
        year,
        month,
        recordTime
      }
    })
  }

  static async deleteAchievement(id: string) {
    return prisma.achievement.delete({
      where: { id }
    })
  }
}
