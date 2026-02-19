'use client'

import { useState, useEffect } from 'react'
import { GitBranch, MessageSquare, Network, Settings } from 'lucide-react'
import ChatInterface from '@/components/ChatInterface'
import GitGraphSidebar from '@/components/GitGraphSidebar'
import TreeVisualizer from '@/components/TreeVisualizer'
import SettingsDialog from '@/components/SettingsDialog'

export default function Home() {
  const [currentView, setCurrentView] = useState<'chat' | 'tree'>('chat')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 防止 hydration 不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen bg-zinc-50">
        <div className="w-72 bg-white border-r border-zinc-200" />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-zinc-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5 text-zinc-900" />
                  <h1 className="text-sm font-semibold tracking-tight text-zinc-900">ErdTree</h1>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 overflow-hidden">
            <div className="h-full bg-white rounded-lg border border-zinc-200" />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-50">
      <GitGraphSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-zinc-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-zinc-900" />
                <h1 className="text-sm font-semibold tracking-tight text-zinc-900">ErdTree</h1>
              </div>
              <span className="text-xs text-zinc-400">/</span>
              <span className="text-xs text-zinc-500">对话分支管理</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-zinc-100 rounded-md p-0.5">
                <button
                  onClick={() => setCurrentView('chat')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    currentView === 'chat'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>对话</span>
                </button>
                <button
                  onClick={() => setCurrentView('tree')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    currentView === 'tree'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>图谱</span>
                </button>
              </div>
              
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
                title="设置"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-white rounded-lg border border-zinc-200 overflow-hidden">
            {currentView === 'chat' ? <ChatInterface /> : <TreeVisualizer />}
          </div>
        </main>
      </div>

      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
