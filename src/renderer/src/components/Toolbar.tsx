import React from 'react'
import { ClipboardList, CalendarDays, Rocket, Trophy, Settings } from 'lucide-react'
import { useStore, Tab } from '../store/useStore'
import clsx from 'clsx'

const tabs = [
  { id: 'tasks', label: '任务', icon: ClipboardList },
  { id: 'plan', label: '计划', icon: CalendarDays },
  { id: 'longterm', label: '长期', icon: Rocket },
  { id: 'achievements', label: '成就', icon: Trophy },
  { id: 'settings', label: '设置', icon: Settings },
] as const

export function Toolbar() {
  const { activeTab, setActiveTab, setHovering } = useStore()

  return (
    <div 
      className="flex justify-around items-center py-2 bg-black/40 backdrop-blur-md border-t border-white/10 no-drag"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as Tab)}
          className={clsx(
            "flex flex-col items-center gap-1 transition-colors p-2 rounded-lg",
            activeTab === tab.id ? "text-blue-400" : "text-white/50 hover:text-white/80"
          )}
        >
          <tab.icon size={20} />
          <span className="text-[10px]">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
