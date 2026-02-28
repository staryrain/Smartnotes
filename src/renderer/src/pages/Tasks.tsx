import React, { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Circle, CheckCircle, Trash2, Infinity as InfinityIcon } from 'lucide-react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

export function Tasks() {
  const { tasks, fetchTasks, longTerms, fetchLongTerms } = useStore()
  const [input, setInput] = useState('')

  useEffect(() => {
    fetchTasks()
    fetchLongTerms()
  }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await window.api.createTask(input)
    setInput('')
    fetchTasks()
  }

  const toggle = async (task: any) => {
    const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING'
    await window.api.updateTaskStatus(task.id, newStatus)
    fetchTasks()
  }

  const togglePersist = async (e: React.MouseEvent, task: any) => {
    e.stopPropagation()
    await window.api.updateTaskPersist(task.id, !task.isPersist)
    fetchTasks()
  }

  const remove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await window.api.deleteTask(id)
    fetchTasks()
    
  }

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length
  const sortedTasks = [...tasks].sort((a: any, b: any) => {
    if (a.status !== b.status) {
      return a.status === 'COMPLETED' ? 1 : -1
    }

    const aTime = new Date(a.createdAt ?? 0).getTime()
    const bTime = new Date(b.createdAt ?? 0).getTime()
    return bTime - aTime
  })

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto no-scrollbar">
      {/* Long Term Goals */}
      {longTerms.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-white/40 mb-3 uppercase tracking-wider pl-1">长期计划</h2>
          <div className="space-y-3 pl-1">
            {longTerms.filter(t => t.status === 'PENDING').map(t => (
              <div key={t.id} className="flex items-start gap-3 text-white/90 font-medium text-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2.5 flex-shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.6)]"></div>
                <span className="leading-relaxed">{t.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={add} className="mb-8">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="add..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:bg-white/10 focus:border-white/20 transition placeholder:text-white/20 text-lg"
        />
      </form>

      {/* Tasks List */}
      <div className="flex-1 space-y-3">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-white/20">
            <div className="text-sm">今日暂无任务</div>
            <div className="text-xs mt-1">添加第一个任务开始吧</div>
          </div>
        )}
        
        <AnimatePresence>
          {sortedTasks.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition cursor-pointer border border-transparent hover:border-white/5"
              onClick={() => toggle(t)}
            >
              <button className={clsx("transition-colors mt-0.5", t.status === 'COMPLETED' ? "text-green-400" : "text-white/20 group-hover:text-white/40")}>
                {t.status === 'COMPLETED' ? <CheckCircle size={22} /> : <Circle size={22} />}
              </button>
              <span className={clsx("flex-1 transition-all leading-relaxed", t.status === 'COMPLETED' && "line-through text-white/30")}>
                {t.content}
              </span>
              
              <button 
                onClick={(e) => togglePersist(e, t)}
                className={clsx("p-2 rounded-lg transition opacity-0 group-hover:opacity-100", t.isPersist ? "text-yellow-400 opacity-100" : "text-white/20 hover:text-white/60 hover:bg-white/10")}
                title={t.isPersist ? "Persistent task (won't clear tomorrow)" : "Click to persist"}
              >
                <InfinityIcon size={18} />
              </button>

              <button 
                onClick={(e) => remove(e, t.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-white/10 rounded-lg transition"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-white/20 font-medium tracking-wider">
        {completedCount} / {tasks.length} 已完成
      </div>
    </div>
  )
}
