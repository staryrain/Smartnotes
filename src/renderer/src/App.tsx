import React, { useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { Toolbar } from './components/Toolbar'
import { Tasks } from './pages/Tasks'
import { Plan } from './pages/Plan'
import { LongTerm } from './pages/LongTerm'
import { Achievements } from './pages/Achievements'
import { Settings } from './pages/Settings'
import { useStore } from './store/useStore'
import clsx from 'clsx'

function App() {
  const { activeTab, opacity } = useStore()

  return (
    <div 
      className="flex flex-col h-full bg-black/80 text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-opacity duration-300"
      style={{ opacity }}
    >
      <TopBar />
      
      <main className="flex-1 overflow-hidden relative">
        <div className={clsx("absolute inset-0 transition-opacity duration-300", activeTab === 'tasks' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
          <Tasks />
        </div>
        <div className={clsx("absolute inset-0 transition-opacity duration-300", activeTab === 'plan' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
          <Plan />
        </div>
        <div className={clsx("absolute inset-0 transition-opacity duration-300", activeTab === 'longterm' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
          <LongTerm />
        </div>
        <div className={clsx("absolute inset-0 transition-opacity duration-300", activeTab === 'achievements' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
          <Achievements />
        </div>
        <div className={clsx("absolute inset-0 transition-opacity duration-300", activeTab === 'settings' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
          <Settings />
        </div>
      </main>

      <Toolbar />
    </div>
  )
}

export default App
