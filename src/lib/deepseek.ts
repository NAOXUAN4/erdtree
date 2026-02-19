// DeepSeek API 服务层
// 通过 Next.js API Route 调用，避免在客户端暴露 API Key

// 消息类型定义
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// 请求选项
export interface ChatOptions {
  model?: 'chat' | 'reasoner'
  temperature?: number
  max_tokens?: number
  stream?: boolean
  onChunk?: (chunk: string) => void
}

// 响应类型
export interface ChatResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
}

// 获取模型名称
function getModelName(type: 'chat' | 'reasoner' = 'chat'): string {
  const models = {
    chat: 'deepseek-chat',
    reasoner: 'deepseek-reasoner',
  }
  return models[type] || models.chat
}

/**
 * 发送聊天请求 (流式)
 * 调用本地 API Route，避免暴露 API Key
 */
export async function chatStreamFetch(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const modelName = getModelName(options.model || 'chat')

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
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
): Promise<ChatResponse> {
  const modelName = getModelName(options.model || 'chat')

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
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
    content: data.content || '',
    usage: data.usage,
    model: data.model || modelName,
  }
}

/**
 * 生成对话标题 (用于自动命名分支)
 */
export async function generateTitle(content: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: '你是一个对话标题生成助手。请根据用户的输入生成一个简短的标题（不超过20个字），直接返回标题文本，不要添加任何解释。',
    },
    {
      role: 'user',
      content: `请为以下对话内容生成标题：\n\n${content.slice(0, 200)}`,
    },
  ]

  try {
    const response = await chat(messages, {
      model: 'chat',
      temperature: 0.5,
      max_tokens: 50,
    })
    return response.content.trim() || '新对话'
  } catch {
    return '新对话'
  }
}

/**
 * 生成对话摘要 (用于长对话压缩)
 */
export async function generateSummary(messages: ChatMessage[]): Promise<string> {
  const conversationText = messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n\n')

  const summaryMessages: ChatMessage[] = [
    {
      role: 'system',
      content: '你是一个对话摘要助手。请将以下对话内容总结为简洁的摘要，保留关键信息和决策点。摘要长度控制在200字以内。',
    },
    {
      role: 'user',
      content: conversationText,
    },
  ]

  try {
    const response = await chat(summaryMessages, {
      model: 'chat',
      temperature: 0.3,
      max_tokens: 300,
    })
    return response.content.trim()
  } catch {
    return '[摘要生成失败]'
  }
}

/**
 * 估算 token 数量 (简单估算)
 */
export function estimateTokens(text: string): number {
  // 中文每个字符约 1.5 tokens，英文每个单词约 1.3 tokens
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = text.split(/\s+/).length
  return Math.ceil(chineseChars * 1.5 + englishWords * 1.3)
}

/**
 * 检查配置是否有效
 */
export function isConfigValid(): boolean {
  // 客户端无法直接访问环境变量，假设配置正确
  // 实际验证在服务端 API Route 中进行
  return true
}
