import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LLMConfig {
  id: string
  name: string
  provider: 'deepseek' | 'openai' | 'custom'
  apiKey: string
  baseUrl: string
  model: string
  isDefault: boolean
}

interface SettingsState {
  // LLM 配置列表
  llmConfigs: LLMConfig[]
  // 当前使用的配置 ID
  activeConfigId: string | null
  // 系统设置
  settings: {
    autoSave: boolean
    theme: 'light' | 'dark' | 'system'
    language: 'zh' | 'en'
  }

  // Actions
  addLLMConfig: (config: Omit<LLMConfig, 'id'>) => string
  updateLLMConfig: (id: string, config: Partial<LLMConfig>) => void
  deleteLLMConfig: (id: string) => void
  setActiveConfig: (id: string) => void
  getActiveConfig: () => LLMConfig | null
  setDefaultConfig: (id: string) => void
  updateSettings: (settings: Partial<SettingsState['settings']>) => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

// 默认 DeepSeek 配置
const defaultDeepSeekConfig: LLMConfig = {
  id: 'default-deepseek',
  name: 'DeepSeek-V3',
  provider: 'deepseek',
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  isDefault: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      llmConfigs: [defaultDeepSeekConfig],
      activeConfigId: 'default-deepseek',
      settings: {
        autoSave: true,
        theme: 'system',
        language: 'zh',
      },

      addLLMConfig: (config) => {
        const id = generateId()
        const newConfig: LLMConfig = { ...config, id }
        
        set((state) => {
          const configs = [...state.llmConfigs, newConfig]
          // 如果是第一个配置，设为默认
          if (configs.length === 1) {
            newConfig.isDefault = true
          }
          return {
            llmConfigs: configs,
            activeConfigId: state.activeConfigId || id,
          }
        })
        
        return id
      },

      updateLLMConfig: (id, config) => {
        set((state) => ({
          llmConfigs: state.llmConfigs.map((c) =>
            c.id === id ? { ...c, ...config } : c
          ),
        }))
      },

      deleteLLMConfig: (id) => {
        set((state) => {
          const configs = state.llmConfigs.filter((c) => c.id !== id)
          // 如果删除的是当前激活的配置，切换到默认配置
          let newActiveId = state.activeConfigId
          if (state.activeConfigId === id) {
            const defaultConfig = configs.find((c) => c.isDefault)
            newActiveId = defaultConfig?.id || configs[0]?.id || null
          }
          return {
            llmConfigs: configs,
            activeConfigId: newActiveId,
          }
        })
      },

      setActiveConfig: (id) => {
        set({ activeConfigId: id })
      },

      getActiveConfig: () => {
        const state = get()
        return state.llmConfigs.find((c) => c.id === state.activeConfigId) || null
      },

      setDefaultConfig: (id) => {
        set((state) => ({
          llmConfigs: state.llmConfigs.map((c) => ({
            ...c,
            isDefault: c.id === id,
          })),
        }))
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },
    }),
    {
      name: 'settings-storage',
    }
  )
)
