import React, { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Trophy, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function Achievements() {
  const { achievements, fetchAchievements } = useStore()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [content, setContent] = useState('')

  useEffect(() => {
    fetchAchievements()
  }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    await window.api.createAchievement(content, year, month)
    setContent('')
    fetchAchievements()
  }

  const remove = async (id: string) => {
    await window.api.deleteAchievement(id)
    fetchAchievements()
  }

  // Group achievements
  const grouped = achievements.reduce((acc: any, curr: any) => {
    if (!acc[curr.year]) acc[curr.year] = {}
    if (!acc[curr.year][curr.month]) acc[curr.year][curr.month] = []
    acc[curr.year][curr.month].push(curr)
    return acc
  }, {})

  // Sort years desc
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="text-yellow-400" />
        成就
      </h1>

      <form onSubmit={add} className="mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="w-20 bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none text-center text-white"
            placeholder="Year"
          />
          <input
            type="number"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            min={1} max={12}
            className="w-16 bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none text-center text-white"
            placeholder="Mon"
          />
        </div>
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="记录一个成就..."
          className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 outline-none focus:bg-black/40 transition text-white"
        />
        <button type="submit" className="hidden">Add</button>
      </form>

      <div className="space-y-8 relative pl-4 border-l border-white/10 ml-2">
        {years.map(y => (
          <div key={y} className="relative">
            <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-white/20 border-2 border-gray-900"></div>
            <h2 className="text-xl font-bold text-white/40 mb-4 pl-2">{y}年</h2>
            
            <div className="space-y-6">
              {Object.keys(grouped[y]).sort((a, b) => Number(b) - Number(a)).map(m => (
                <div key={m} className="pl-2">
                  <h3 className="text-sm font-medium text-white/30 mb-2">{m}月</h3>
                  <div className="space-y-3">
                    {grouped[y][m].map((a: any) => (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group relative bg-gradient-to-r from-white/10 to-transparent p-4 rounded-xl border-l-4 border-yellow-400"
                      >
                        <div className="text-xl font-bold text-white/90 mb-1 pr-6">{a.content}</div>
                        <div className="text-xs text-white/40 text-right">{a.recordTime}</div>
                        <button 
                          onClick={() => remove(a.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-white/30 hover:text-red-400 hover:bg-white/10 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
