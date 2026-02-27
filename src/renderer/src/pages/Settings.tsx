import React from 'react'
import { useStore } from '../store/useStore'
import { Settings as SettingsIcon } from 'lucide-react'

export function Settings() {
  const { opacity, setOpacity } = useStore()

  return (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <SettingsIcon />
        设置
      </h1>

      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <label className="block text-sm font-medium text-white/60 mb-4">
          窗口透明度
        </label>
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-white/30 mt-2">
          <span>20%</span>
          <span>100%</span>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-white/20">
        Smartnotes v1.0.0
      </div>
    </div>
  )
}
