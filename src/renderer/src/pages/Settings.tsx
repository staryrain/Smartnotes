import React, { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Settings as SettingsIcon } from 'lucide-react'

export function Settings() {
  const { 
    opacity, setOpacity,
    isSkipTaskbar, setSkipTaskbar,
    isAutoLaunch, setAutoLaunch,
    checkAutoLaunch
  } = useStore()

  useEffect(() => {
    checkAutoLaunch()
  }, [])

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <SettingsIcon />
        设置
      </h1>

      <div className="space-y-6">
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

        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white/90">开机自启</span>
              <span className="text-xs text-white/40">系统启动时自动运行软件</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAutoLaunch}
                onChange={(e) => setAutoLaunch(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white/90">隐藏任务栏图标</span>
              <span className="text-xs text-white/40">仅在系统托盘显示图标</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isSkipTaskbar}
                onChange={(e) => setSkipTaskbar(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-white/20">
        Smartnotes v1.0.0
      </div>
    </div>
  )
}
