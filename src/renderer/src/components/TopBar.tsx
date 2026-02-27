import React from 'react'
import { useStore } from '../store/useStore'
import { MousePointer2, X } from 'lucide-react'
import clsx from 'clsx'

export function TopBar() {
  const { isPenetrate, togglePenetrate, setHovering } = useStore()

  const close = () => {
    window.api.minimizeToTray()
  }

  return (
    <div 
      className="flex justify-between items-center p-3 drag-region bg-gradient-to-b from-black/40 to-transparent"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex items-center gap-2 text-sm font-bold pl-2 text-white/90 select-none">
        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
        桌面智签
      </div>
      <div className="flex items-center gap-2 no-drag">
        {/* Date Display */}
        <div className="flex items-center gap-2 mr-2 text-xs text-white/50 select-none">
          <span>{new Date().getMonth() + 1}月{new Date().getDate()}日</span>
          <span>{['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()]}</span>
        </div>

        <button 
          onClick={togglePenetrate}
          className={clsx("p-1.5 rounded-md transition hover:bg-white/10", isPenetrate ? "text-white/30" : "text-green-400")}
          title={isPenetrate ? "Click through enabled" : "Interactive mode"}
        >
          <MousePointer2 size={16} />
        </button>
        <button 
          onClick={close}
          className="p-1.5 rounded-md transition hover:bg-white/10 text-white/70 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
