'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Check, Settings, Key, Globe, Bot, ChevronDown } from 'lucide-react'
import { useSettingsStore, LLMConfig } from '@/store/useSettingsStore'

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
    if (confirm('确定要删除此配置吗？')) {
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
    <div className="fixed inset-0 bg-zinc-950/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-[600px] max-h-[80vh] flex flex-col border border-zinc-200 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-900">设置</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200">
          <button
            onClick={() => setActiveTab('llm')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-medium transition-colors ${
              activeTab === 'llm'
                ? 'text-zinc-900 border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>模型配置</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-zinc-900 border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>通用设置</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'llm' ? (
            <div className="flex h-full">
              {/* Config List */}
              <div className="w-48 border-r border-zinc-200 bg-zinc-50/50">
                <div className="p-3">
                  <button
                    onClick={handleAddNew}
                    className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium bg-zinc-900 text-zinc-50 rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加配置</span>
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
                          ? 'bg-zinc-200 text-zinc-900'
                          : 'hover:bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ 
                            backgroundColor: activeConfigId === config.id ? '#18181b' : '#d4d4d8' 
                          }}
                        />
                        <span className="text-xs font-medium truncate">{config.name}</span>
                      </div>
                      {config.isDefault && (
                        <span className="text-[10px] text-zinc-400 flex-shrink-0">默认</span>
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
                      <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                        配置名称
                      </label>
                      <input
                        type="text"
                        value={editingConfig.name}
                        onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                        placeholder="例如：DeepSeek-V3"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                        提供商
                      </label>
                      <select
                        value={editingConfig.provider}
                        onChange={(e) => setEditingConfig({ 
                          ...editingConfig, 
                          provider: e.target.value as LLMConfig['provider'],
                          // 自动填充默认配置
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
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                      >
                        <option value="deepseek">DeepSeek</option>
                        <option value="openai">OpenAI</option>
                        <option value="custom">自定义</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                        API Key
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type={showApiKey[editingConfig.id] ? 'text' : 'password'}
                          value={editingConfig.apiKey}
                          onChange={(e) => setEditingConfig({ ...editingConfig, apiKey: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-10 pr-20 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                          placeholder="sk-..."
                        />
                        <button
                          onClick={() => toggleApiKeyVisibility(editingConfig.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-700"
                        >
                          {showApiKey[editingConfig.id] ? '隐藏' : '显示'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                        Base URL
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          value={editingConfig.baseUrl}
                          onChange={(e) => setEditingConfig({ ...editingConfig, baseUrl: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                          placeholder="https://api.example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                        模型
                      </label>
                      <input
                        type="text"
                        value={editingConfig.model}
                        onChange={(e) => setEditingConfig({ ...editingConfig, model: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                        placeholder="例如：deepseek-chat"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={editingConfig.isDefault}
                        onChange={(e) => setEditingConfig({ ...editingConfig, isDefault: e.target.checked })}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                      />
                      <label htmlFor="isDefault" className="text-xs text-zinc-700">
                        设为默认配置
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                      {!isAddingNew && (
                        <button
                          onClick={() => handleDelete(editingConfig.id)}
                          className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>删除</span>
                        </button>
                      )}
                      <div className="flex items-center space-x-2 ml-auto">
                        <button
                          onClick={() => {
                            setEditingConfig(null)
                            setIsAddingNew(false)
                          }}
                          className="px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={!editingConfig.name || !editingConfig.apiKey}
                          className="flex items-center space-x-1 px-3 py-2 text-xs font-medium bg-zinc-900 text-zinc-50 rounded-md hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>保存</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                    <Bot className="w-8 h-8 mb-2" />
                    <p className="text-sm">选择一个配置或添加新配置</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  主题
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                >
                  <option value="system">跟随系统</option>
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  语言
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSettings({ language: e.target.value as 'zh' | 'en' })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="autoSave"
                  checked={settings.autoSave}
                  onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                />
                <label htmlFor="autoSave" className="text-xs text-zinc-700">
                  自动保存对话
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsDialog
