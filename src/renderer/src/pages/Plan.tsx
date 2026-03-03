import React, { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Calendar, Trash2, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export function Plan() {
  const { plans, fetchPlans } = useStore()
  const [input, setInput] = useState('')
  
  // Time Picker State
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [targetDate, setTargetDate] = useState('') // YYYY-MM-DD
  const [targetHour, setTargetHour] = useState(6)

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

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const openTimePicker = (plan: any) => {
    setEditingPlan(plan)
    
    if (plan.isCustomTime && plan.planDate) {
      const d = new Date(plan.planDate)
      setTargetDate(getLocalDateString(d))
      setTargetHour(d.getHours())
    } else {
      // Default: Next Hour from NOW
      const now = new Date()
      const nextHour = new Date(now)
      nextHour.setHours(now.getHours() + 1, 0, 0, 0)
      
      setTargetDate(getLocalDateString(nextHour))
      setTargetHour(nextHour.getHours())
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetDate(e.target.value)
    // Requirement: If user changes date, hour becomes 6 AM
    setTargetHour(6)
  }

  const saveTime = async () => {
    if (!editingPlan || !targetDate) return
    
    const [year, month, day] = targetDate.split('-').map(Number)
    const d = new Date()
    d.setFullYear(year, month - 1, day)
    d.setHours(targetHour, 0, 0, 0)
    
    // Check if future
    if (d.getTime() <= Date.now()) {
      return // Should show error but simple return for now
    }
    
    await window.api.updatePlanTime(editingPlan.id, d.getTime(), true)
    setEditingPlan(null)
    fetchPlans()
  }

  const clearTime = async () => {
    if (!editingPlan) return
    await window.api.updatePlanTime(editingPlan.id, null, false)
    setEditingPlan(null)
    fetchPlans()
  }

  const formatPlanTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isSameYear = date.getFullYear() === now.getFullYear()
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    
    let text = isSameYear 
      ? `${month}月${day}日` 
      : `${date.getFullYear()}年${month}月${day}日`
      
    if (hour !== 6) {
      text += ` ${hour}时`
    }
    
    return text + ' 发布'
  }

  const todayStr = getLocalDateString(new Date())
  const currentHour = new Date().getHours()

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto relative">
      <h1 className="text-3xl font-bold mb-2">计划</h1>
      <p className="text-sm text-white/50 mb-6">将在明早 06:00 或指定时间自动转入任务列表</p>

      <form onSubmit={add} className="mb-8">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="规划..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:bg-white/10 focus:border-white/20 transition placeholder:text-white/20 text-lg"
        />
      </form>

      <div className="flex-1 space-y-3">
        {plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-white/20">
            <Calendar size={48} className="mb-2 opacity-50" />
            <div className="text-sm">暂无计划</div>
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
              <div className="flex flex-col flex-1 min-w-0 mr-4">
                <span className="text-white/80 truncate">{p.content}</span>
                {p.isCustomTime && (
                  <span className="text-xs text-blue-400 mt-1">
                    {formatPlanTime(p.planDate)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition space-x-1">
                <button
                  onClick={() => openTimePicker(p)}
                  className={clsx(
                    "p-2 rounded-lg transition",
                    p.isCustomTime ? "text-blue-400 bg-blue-400/10" : "text-white/40 hover:text-white/80 hover:bg-white/10"
                  )}
                  title="设置发布时间"
                >
                  <Clock size={18} />
                </button>
                <button 
                  onClick={() => remove(p.id)}
                  className="p-2 text-red-400 hover:bg-white/10 rounded-lg transition"
                  title="删除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Time Picker Modal */}
      <AnimatePresence>
        {editingPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1e1e1e] border border-white/10 p-6 rounded-2xl w-80 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">设置发布时间</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1">日期</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={handleDateChange}
                    min={todayStr}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-white/20 text-sm text-white scheme-dark"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-white/40 mb-1">时间 (整点)</label>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const isDisabled = targetDate === todayStr && i <= currentHour
                      return (
                        <button
                          key={i}
                          onClick={() => !isDisabled && setTargetHour(i)}
                          disabled={isDisabled}
                          className={clsx(
                            "h-8 rounded-lg text-xs font-medium transition",
                            targetHour === i 
                              ? "bg-blue-500 text-white" 
                              : "bg-white/5 text-white/60 hover:bg-white/10",
                            isDisabled && "opacity-20 cursor-not-allowed"
                          )}
                        >
                          {i}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                 {editingPlan.isCustomTime && (
                  <button
                    onClick={clearTime}
                    className="px-4 py-2 rounded-xl text-sm text-white/60 hover:bg-white/5 transition mr-auto"
                  >
                    恢复默认
                  </button>
                )}
                
                <button
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl text-sm text-white/60 hover:bg-white/5 transition"
                >
                  取消
                </button>
                <button
                  onClick={saveTime}
                  className="px-4 py-2 rounded-xl text-sm bg-blue-500 hover:bg-blue-600 text-white transition font-medium"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
