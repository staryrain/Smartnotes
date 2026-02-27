import React, { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Calendar, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Plan() {
  const { plans, fetchPlans } = useStore()
  const [input, setInput] = useState('')

  useEffect(() => {
    fetchPlans()
  }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await window.api.createPlan(input)
    setInput('')
    fetchPlans()
  }

  const remove = async (id: string) => {
    await window.api.deletePlan(id)
    fetchPlans()
  }

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto no-scrollbar">
      <h1 className="text-3xl font-bold mb-2">明日计划</h1>
      <p className="text-sm text-white/50 mb-6">将在明早 06:00 自动转入任务列表</p>

      <form onSubmit={add} className="mb-8">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="规划明天..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:bg-white/10 focus:border-white/20 transition placeholder:text-white/20 text-lg"
        />
      </form>

      <div className="flex-1 space-y-3">
        {plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-white/20">
            <Calendar size={48} className="mb-2 opacity-50" />
            <div className="text-sm">暂无明日计划</div>
          </div>
        )}
        
        <AnimatePresence>
          {plans.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition border border-transparent hover:border-white/5"
            >
              <span className="text-white/80">{p.content}</span>
              <button 
                onClick={() => remove(p.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-white/10 rounded-lg transition"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
