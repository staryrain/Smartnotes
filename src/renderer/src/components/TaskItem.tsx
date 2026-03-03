import React, { useState, useRef, useEffect } from 'react'
import { Circle, CheckCircle, Trash2, Infinity as InfinityIcon, Pin, GripVertical } from 'lucide-react'
import clsx from 'clsx'

export interface TaskItemProps {
  task: any
  isOverlay?: boolean
  toggle?: (task: any) => void
  togglePersist?: (e: React.MouseEvent, task: any) => void
  togglePin?: (e: React.MouseEvent, task: any) => void
  updateContent?: (id: string, content: string) => void
  remove?: (e: React.MouseEvent, id: string) => void
  style?: React.CSSProperties
  dragListeners?: any
  dragAttributes?: any
}

export const TaskItem = React.forwardRef<HTMLDivElement, TaskItemProps>(({ 
  task, 
  isOverlay,
  toggle, 
  togglePersist, 
  togglePin, 
  updateContent,
  remove,
  style,
  dragListeners,
  dragAttributes
}, ref) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.content)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      // Optional: Select all text on focus
      // inputRef.current.select() 
    }
  }, [isEditing])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOverlay) return
    setIsEditing(true)
    setEditValue(task.content)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue.trim() && editValue !== task.content) {
      updateContent?.(task.id, editValue)
    } else {
      setEditValue(task.content)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(task.content)
    }
  }

  return (
    <div
      ref={ref}
      style={style}
      className={clsx(
        "group flex items-start gap-3 p-4 rounded-2xl bg-white/5 transition border border-transparent",
        isOverlay ? "bg-white/10 shadow-2xl scale-[1.04] border-white/10" : "hover:bg-white/10 hover:border-white/5",
        task.status === 'COMPLETED' && !isOverlay && "opacity-60"
      )}
    >
      {/* Drag Handle */}
      {task.status !== 'COMPLETED' && !isOverlay && (
        <button 
          className="cursor-grab active:cursor-grabbing p-1 text-white/10 hover:text-white/40 transition-colors -ml-2 mt-0.5 touch-none"
          {...dragListeners}
          {...dragAttributes}
        >
          <GripVertical size={18} />
        </button>
      )}
      
      {/* For Overlay */}
      {isOverlay && (
         <div className="p-1 text-white/40 -ml-2 mt-0.5">
           <GripVertical size={18} />
         </div>
      )}

      <button 
        onClick={(e) => {
          e.stopPropagation()
          toggle?.(task)
        }}
        className={clsx("transition-colors mt-0.5 cursor-pointer", task.status === 'COMPLETED' ? "text-green-400" : "text-white/20 group-hover:text-white/40")}
      >
        {task.status === 'COMPLETED' ? <CheckCircle size={22} /> : <Circle size={22} />}
      </button>
      
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent border-none outline-none text-white leading-relaxed p-0 m-0 w-full font-[inherit]"
        />
      ) : (
        <span 
          onDoubleClick={handleDoubleClick}
          className={clsx("flex-1 transition-all leading-relaxed select-none cursor-text", task.status === 'COMPLETED' && "line-through text-white/30")}
        >
          {task.content}
        </span>
      )}
      
      <div className="flex items-center gap-1">
        {task.status !== 'COMPLETED' && (
          <>
            <button 
              onClick={(e) => togglePin?.(e, task)}
              className={clsx("p-1.5 rounded-lg transition", task.isPinned ? "text-indigo-400 opacity-100" : "text-white/20 hover:text-white/60 hover:bg-white/10 opacity-0 group-hover:opacity-100")}
              title={task.isPinned ? "取消置顶" : "置顶"}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Pin size={16} />
            </button>
            <button 
              onClick={(e) => togglePersist?.(e, task)}
              className={clsx("p-1.5 rounded-lg transition opacity-0 group-hover:opacity-100", task.isPersist ? "text-amber-400" : "text-white/20 hover:text-white/60 hover:bg-white/10")}
              title={task.isPersist ? "持久任务（明日不清除）" : "点击设为持久"}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <InfinityIcon size={16} />
            </button>
          </>
        )}

        <button 
          onClick={(e) => remove?.(e, task.id)}
          className="p-1.5 text-red-400 hover:bg-white/10 rounded-lg transition opacity-0 group-hover:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
})

TaskItem.displayName = 'TaskItem'
