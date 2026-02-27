import { PrismaClient } from '@prisma/client'
import { app } from 'electron'
import { join } from 'path'

// In production, use userData directory. In dev, use local file.
// Note: In a real production app, you'd need to handle migration or copying the DB file.
const dbUrl = app.isPackaged
  ? `file:${join(app.getPath('userData'), 'smartnotes.db')}`
  : process.env.DATABASE_URL || 'file:./dev.db'

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
})
