// LLM API 服务层
// 支持多提供商配置，通过 Next.js API Route 调用

import { useSettingsStore, LLMConfig } from '@/store/useSettingsStore'

// 消息类型定义
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// 请求选项
export interface ChatOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

// 获取当前激活的 LLM 配置
function getActiveConfig(): LLMConfig | null {
  // 在客户端运行时获取 store
  if (typeof window !== 'undefined') {
    return useSettingsStore.getState().getActiveConfig()
  }
  return null
}

/**
 * 发送聊天请求 (流式)
 * 调用本地 API Route，避免暴露 API Key
 */
export async function chatStreamFetch(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const config = getActiveConfig()
  
  if (!config) {
    throw new Error('未配置 LLM，请先在设置中添加 API 配置')
  }

  if (!config.apiKey) {
    throw new Error('API Key 未设置，请先在设置中配置')
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: options.model || config.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API 请求失败: ${response.status} - ${error}`)
  }

  if (!response.body) {
    throw new Error('响应体为空')
  }

  return response.body
}

/**
 * 发送聊天请求 (非流式)
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<{ content: string; model: string }> {
  const config = getActiveConfig()
  
  if (!config) {
    throw new Error('未配置 LLM，请先在设置中添加 API 配置')
  }

  if (!config.apiKey) {
    throw new Error('API Key 未设置，请先在设置中配置')
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: options.model || config.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4096,
      stream: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API 请求失败: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return {
    content: data.choices?.[0]?.message?.content || '',
    model: data.model || config.model,
  }
}

// 为了保持向后兼容，保留原来的导出
export { chatStreamFetch as chatStreamFetchDeepSeek }
