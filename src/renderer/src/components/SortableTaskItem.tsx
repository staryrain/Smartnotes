import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskItem } from './TaskItem'
import { motion } from 'framer-motion'

interface SortableTaskItemProps {
  task: any
  toggle: (task: any) => void
  togglePersist: (e: React.MouseEvent, task: any) => void
  togglePin: (e: React.MouseEvent, task: any) => void
  updateContent: (id: string, content: string) => void
  remove: (e: React.MouseEvent, id: string) => void
  isOverlay?: boolean
}

export function SortableTaskItem({ task, toggle, togglePersist, togglePin, updateContent, remove }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative' as const,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="touch-none"
    >
      <TaskItem 
        task={task} 
        toggle={toggle} 
        togglePersist={togglePersist} 
        togglePin={togglePin} 
        updateContent={updateContent}
        remove={remove}
        dragListeners={listeners}
        dragAttributes={attributes}
      />
    </motion.div>
  )
}
