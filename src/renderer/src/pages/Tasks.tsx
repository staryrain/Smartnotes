import React, { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../store/useStore'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
  DragCancelEvent,
  DropAnimation,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskItem } from '../components/TaskItem'
import { SortableTaskItem } from '../components/SortableTaskItem'
import clsx from 'clsx'

export function Tasks() {
  const { tasks, fetchTasks, longTerms, fetchLongTerms } = useStore()
  const [input, setInput] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])

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

  const togglePin = async (e: React.MouseEvent, task: any) => {
    e.stopPropagation()
    await window.api.updateTaskPin(task.id, !task.isPinned)
    fetchTasks()
  }

  const remove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await window.api.deleteTask(id)
    fetchTasks()
  }

  const sortedTasks = useMemo(() => {
    // Separate Completed and Pending
    const pending = tasks.filter(t => t.status !== 'COMPLETED')
    const completed = tasks.filter(t => t.status === 'COMPLETED')

    // Sort Pending
    pending.sort((a: any, b: any) => {
      // 1. Pinned first
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1
      }
      
      // 2. Use list_order if different
      if (a.list_order !== b.list_order) {
        return (a.list_order || 0) - (b.list_order || 0)
      }

      // 3. Fallback to existing logic if list_order is 0 (e.g. legacy or new items)
      if (a.isPinned && b.isPinned) {
        const aPin = a.pinnedAt || 0
        const bPin = b.pinnedAt || 0
        return aPin - bPin
      }

      const aTime = new Date(a.createdAt ?? 0).getTime()
      const bTime = new Date(b.createdAt ?? 0).getTime()
      return bTime - aTime
    })

    // Sort Completed (Time DESC)
    completed.sort((a: any, b: any) => {
      const aTime = new Date(a.createdAt ?? 0).getTime()
      const bTime = new Date(b.createdAt ?? 0).getTime()
      return bTime - aTime
    })

    return [...pending, ...completed]
  }, [tasks])

  // Sync items with sortedTasks, but try to preserve order if possible or just reset
  // For this implementation, we reset on tasks change to ensure data consistency
  // In a real app with backend persistence, we would load order from backend
  useEffect(() => {
    setItems(sortedTasks)
  }, [sortedTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    if (active.id !== over.id) {
      const activeTask = items.find(t => t.id === active.id)
      const overTask = items.find(t => t.id === over.id)

      if (!activeTask || !overTask) return

      // Constraints
      if (overTask.status === 'COMPLETED') return
      if (activeTask.isPinned && !overTask.isPinned) return
      if (!activeTask.isPinned && overTask.isPinned) return

      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      
      const newItems = arrayMove(items, oldIndex, newIndex)
      
      setItems(newItems)
      window.api.reorderTasks(newItems.map(t => t.id))
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const activeItem = useMemo(() => items.find((item) => item.id === activeId), [activeId, items])
  const itemIds = useMemo(() => items.map(t => t.id), [items])

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0',
        },
      },
    }),
  }

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
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
      <div className="flex-1">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-white/20">
            <div className="text-sm">今日暂无任务</div>
            <div className="text-xs mt-1">添加第一个任务开始吧</div>
          </div>
        )}
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className={clsx("space-y-3", activeId && "opacity-85 transition-opacity")}>
              <AnimatePresence mode='popLayout'>
                {items.map(t => (
                  <SortableTaskItem
                    key={t.id}
                    task={t}
                    toggle={toggle}
                    togglePersist={togglePersist}
                    togglePin={togglePin}
                    remove={remove}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId && activeItem ? (
                <TaskItem
                  task={activeItem}
                  isOverlay
                  toggle={toggle}
                  togglePersist={togglePersist}
                  togglePin={togglePin}
                  remove={remove}
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-white/20 font-medium tracking-wider">
        {completedCount} / {tasks.length} 已完成
      </div>
    </div>
  )
}
