import React, { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { CheckCircle, Circle, Trash2, Rocket, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export function LongTerm() {
  const { longTerms, fetchLongTerms, fetchTasks } = useStore()
  const [input, setInput] = useState('')
  const [addingTaskId, setAddingTaskId] = useState<string | null>(null)
  const [taskInput, setTaskInput] = useState('')

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingType, setEditingType] = useState<'goal' | 'subtask' | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchLongTerms()
  }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await window.api.createLongTerm(input)
    setInput('')
    fetchLongTerms()
  }

  const addTask = async (e: React.FormEvent, longTermId: string) => {
    e.preventDefault()
    if (!taskInput.trim()) return
    await window.api.createLongTermSubtask(longTermId, taskInput)
    setTaskInput('')
    setAddingTaskId(null)
    fetchLongTerms()
    fetchTasks()
  }

  const removeTask = async (id: string) => {
    await window.api.deleteLongTermSubtask(id)
    fetchLongTerms()
    fetchTasks()
  }

  const toggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING'
    await window.api.updateLongTermStatus(id, newStatus)
    fetchLongTerms()
  }

  const remove = async (id: string) => {
    await window.api.deleteLongTerm(id)
    fetchLongTerms()
  }

  const saveEdit = async () => {
    if (!editingId || !editingType) return
    
    let original = ''
    if (editingType === 'goal') {
      original = longTerms.find(t => t.id === editingId)?.content
    } else {
      for (const t of longTerms) {
        const st = t.subtasks?.find((s: any) => s.id === editingId)
        if (st) {
          original = st.content
          break
        }
      }
    }

    if (editValue.trim() && editValue !== original) {
      if (editingType === 'goal') {
        await window.api.updateLongTermContent(editingId, editValue)
      } else {
        await window.api.updateLongTermSubtaskContent(editingId, editValue)
      }
      fetchLongTerms()
      fetchTasks()
    }
    setEditingId(null)
    setEditingType(null)
    setEditValue('')
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditingType(null)
      setEditValue('')
    }
  }

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Rocket className="text-purple-400" />
        长期计划
      </h1>

      <form onSubmit={add} className="mb-8">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="设定一个长期目标..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:bg-white/10 focus:border-white/20 transition placeholder:text-white/20 text-lg"
        />
      </form>

      <div className="flex-1 space-y-3">
        {longTerms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-white/20">
            <div className="text-sm">暂无长期计划</div>
          </div>
        )}
        
        <AnimatePresence>
          {longTerms.map(t => (
            <div key={t.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition border border-transparent hover:border-white/5"
              >
                <button 
                  onClick={() => toggle(t.id, t.status)}
                  className={clsx("transition-colors", t.status === 'COMPLETED' ? "text-green-400" : "text-white/20 group-hover:text-white/40")}
                >
                  {t.status === 'COMPLETED' ? <CheckCircle size={22} /> : <Circle size={22} />}
                </button>
                
                <span className={clsx("flex-1 transition-all leading-relaxed", t.status === 'COMPLETED' && "line-through text-white/30")}>
                  {editingId === t.id && editingType === 'goal' ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleEditKeyDown}
                      className="bg-transparent border-none outline-none text-white w-full p-0 m-0 font-[inherit]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className="cursor-text select-none block w-full"
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        setEditingId(t.id)
                        setEditingType('goal')
                        setEditValue(t.content)
                      }}
                    >
                      {t.content}
                    </span>
                  )}
                </span>

                <button 
                  onClick={() => {
                    setAddingTaskId(t.id)
                    setTaskInput('')
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-blue-400 hover:bg-white/10 rounded-lg transition"
                  title="添加关联任务"
                >
                  <Plus size={18} />
                </button>
                
                <button 
                  onClick={() => remove(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-white/10 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>

                {/* Subtask Input */}
                {addingTaskId === t.id && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-black/90 p-3 rounded-xl border border-white/10 shadow-xl backdrop-blur-md">
                    <form onSubmit={(e) => addTask(e, t.id)} className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={taskInput}
                        onChange={e => setTaskInput(e.target.value)}
                        placeholder="添加每日循环任务..."
                        className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:bg-white/20 text-white"
                      />
                      <button type="submit" className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-500/30">
                        Add
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setAddingTaskId(null)
                          setTaskInput('')
                        }}
                        className="text-[10px] bg-white/5 text-white/40 px-2 py-1 rounded-lg hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
              
              {/* Subtasks List */}
              {t.subtasks && t.subtasks.length > 0 && (
                <div className="pl-12 pr-4 space-y-1.5 mt-2 mb-4">
                  {t.subtasks.map((st: any) => (
                    <motion.div
                      key={st.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex items-center justify-between p-2 rounded-lg bg-white/5 border-l-2 border-indigo-400/50"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        {editingId === st.id && editingType === 'subtask' ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleEditKeyDown}
                            className="bg-transparent border-none outline-none text-white/60 text-xs w-full p-0 m-0 font-[inherit]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span 
                            className="text-xs text-white/60 cursor-text select-none block truncate"
                            onDoubleClick={(e) => {
                              e.stopPropagation()
                              setEditingId(st.id)
                              setEditingType('subtask')
                              setEditValue(st.content)
                            }}
                          >
                            {st.content}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => removeTask(st.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-white/10 rounded-md transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
