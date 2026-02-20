'use client'

import { useState, useEffect } from 'react'
import { GitBranch, MessageSquare, Network, Settings, Sun, Moon } from 'lucide-react'
import ChatInterface from '@/components/ChatInterface'
import GitGraphSidebar from '@/components/GitGraphSidebar'
import TreeVisualizer from '@/components/TreeVisualizer'
import SettingsDialog from '@/components/SettingsDialog'
import { useTheme } from '@/components/ThemeProvider'
import { useTranslation } from '@/lib/i18n'

export default function Home() {
  const [currentView, setCurrentView] = useState<'chat' | 'tree'>('chat')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, toggleTheme } = useTheme()
  const { t } = useTranslation()

  // 防止 hydration 不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

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
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <GitGraphSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">ErdTree</h1>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">/</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('app.subtitle')}</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5">
                <button
                  onClick={() => setCurrentView('chat')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    currentView === 'chat'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('nav.chat')}</span>
                </button>
                <button
                  onClick={() => setCurrentView('tree')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    currentView === 'tree'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>{t('nav.tree')}</span>
                </button>
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                title={isDark ? t('settings.light') : t('settings.dark')}
              >
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                title={t('nav.settings')}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
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
