'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Check, Settings, Key, Globe, Bot, Sun, Moon, Languages } from 'lucide-react'
import { useSettingsStore, LLMConfig } from '@/store/useSettingsStore'
import { useTranslation } from '@/lib/i18n'

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsDialog = ({ isOpen, onClose }: SettingsDialogProps) => {
  const {
    llmConfigs,
    activeConfigId,
    settings,
    addLLMConfig,
    updateLLMConfig,
    deleteLLMConfig,
    setActiveConfig,
    setDefaultConfig,
    updateSettings,
  } = useSettingsStore()

  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'llm' | 'general'>('llm')
  const [editingConfig, setEditingConfig] = useState<LLMConfig | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})

  // 重置表单状态
  useEffect(() => {
    if (!isOpen) {
      setEditingConfig(null)
      setIsAddingNew(false)
      setActiveTab('llm')
    }
  }, [isOpen])

  // ESC 关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleAddNew = () => {
    setIsAddingNew(true)
    setEditingConfig({
      id: '',
      name: '',
      provider: 'deepseek',
      apiKey: '',
      baseUrl: '',
      model: '',
      isDefault: false,
    })
  }

  const handleSave = () => {
    if (!editingConfig) return

    if (isAddingNew) {
      addLLMConfig({
        name: editingConfig.name,
        provider: editingConfig.provider,
        apiKey: editingConfig.apiKey,
        baseUrl: editingConfig.baseUrl,
        model: editingConfig.model,
        isDefault: editingConfig.isDefault,
      })
    } else {
      updateLLMConfig(editingConfig.id, editingConfig)
    }

    setEditingConfig(null)
    setIsAddingNew(false)
  }

  const handleDelete = (id: string) => {
    if (confirm(t('settings.confirmDelete'))) {
      deleteLLMConfig(id)
      if (editingConfig?.id === id) {
        setEditingConfig(null)
      }
    }
  }

  const toggleApiKeyVisibility = (configId: string) => {
    setShowApiKey(prev => ({ ...prev, [configId]: !prev[configId] }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-zinc-950/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-[600px] max-h-[80vh] flex flex-col border border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('llm')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-medium transition-colors ${
              activeTab === 'llm'
                ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{t('settings.llmConfig')}</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t('settings.general')}</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'llm' ? (
            <div className="flex h-full">
              {/* Config List */}
              <div className="w-48 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="p-3">
                  <button
                    onClick={handleAddNew}
                    className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('settings.addConfig')}</span>
                  </button>
                </div>
                <div className="px-2 pb-2 space-y-0.5">
                  {llmConfigs.map((config) => (
                    <div
                      key={config.id}
                      onClick={() => {
                        setEditingConfig(config)
                        setIsAddingNew(false)
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                        editingConfig?.id === config.id
                          ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: activeConfigId === config.id ? (settings.theme === 'dark' ? '#fafafa' : '#18181b') : '#d4d4d8'
                          }}
                        />
                        <span className="text-xs font-medium truncate">{config.name}</span>
                      </div>
                      {config.isDefault && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">Default</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Config Editor */}
              <div className="flex-1 p-5 overflow-y-auto">
                {editingConfig ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {t('settings.configName')}
                      </label>
                      <input
                        type="text"
                        value={editingConfig.name}
                        onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500"
                        placeholder="DeepSeek-V3"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {t('settings.provider')}
                      </label>
                      <select
                        value={editingConfig.provider}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          provider: e.target.value as LLMConfig['provider'],
                          baseUrl: e.target.value === 'deepseek'
                            ? 'https://api.deepseek.com'
                            : e.target.value === 'openai'
                            ? 'https://api.openai.com/v1'
                            : editingConfig.baseUrl,
                          model: e.target.value === 'deepseek'
                            ? 'deepseek-chat'
                            : e.target.value === 'openai'
                            ? 'gpt-4'
                            : editingConfig.model,
                        })}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500"
                      >
                        <option value="deepseek">DeepSeek</option>
                        <option value="openai">OpenAI</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {t('settings.apiKey')}
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                        <input
                          type={showApiKey[editingConfig.id] ? 'text' : 'password'}
                          value={editingConfig.apiKey}
                          onChange={(e) => setEditingConfig({ ...editingConfig, apiKey: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md pl-10 pr-20 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500"
                          placeholder="sk-..."
                        />
                        <button
                          onClick={() => toggleApiKeyVisibility(editingConfig.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          {showApiKey[editingConfig.id] ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {t('settings.baseUrl')}
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          value={editingConfig.baseUrl}
                          onChange={(e) => setEditingConfig({ ...editingConfig, baseUrl: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md pl-10 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500"
                          placeholder="https://api.example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {t('settings.model')}
                      </label>
                      <input
                        type="text"
                        value={editingConfig.model}
                        onChange={(e) => setEditingConfig({ ...editingConfig, model: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500"
                        placeholder="deepseek-chat"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={editingConfig.isDefault}
                        onChange={(e) => setEditingConfig({ ...editingConfig, isDefault: e.target.checked })}
                        className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-400 dark:focus:ring-zinc-500"
                      />
                      <label htmlFor="isDefault" className="text-xs text-zinc-700 dark:text-zinc-300">
                        Set as default
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      {!isAddingNew && (
                        <button
                          onClick={() => handleDelete(editingConfig.id)}
                          className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('settings.deleteConfig')}</span>
                        </button>
                      )}
                      <div className="flex items-center space-x-2 ml-auto">
                        <button
                          onClick={() => {
                            setEditingConfig(null)
                            setIsAddingNew(false)
                          }}
                          className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                          {t('settings.cancel')}
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={!editingConfig.name || !editingConfig.apiKey}
                          className="flex items-center space-x-1 px-3 py-2 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('settings.save')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-500">
                    <Bot className="w-8 h-8 mb-2" />
                    <p className="text-sm">Select a config or add new</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Theme */}
              <div>
                <label className="flex items-center space-x-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {settings.theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  <span>{t('settings.theme')}</span>
                </label>
                <div className="flex space-x-2">
                  {(['light', 'dark', 'system'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateSettings({ theme })}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                        settings.theme === theme
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                      }`}
                    >
                      {t(`settings.${theme}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="flex items-center space-x-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  <Languages className="w-3.5 h-3.5" />
                  <span>{t('settings.language')}</span>
                </label>
                <div className="flex space-x-2">
                  {(['zh', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => updateSettings({ language: lang })}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                        settings.language === lang
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                      }`}
                    >
                      {lang === 'zh' ? '中文' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-md">
                <div>
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {t('settings.autoSave')}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Automatically save conversation history
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    settings.autoSave ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white dark:bg-zinc-900 rounded-full transition-transform ${
                      settings.autoSave ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsDialog
