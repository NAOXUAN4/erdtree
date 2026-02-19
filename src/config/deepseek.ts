// DeepSeek API 配置
// 文档: https://platform.deepseek.com/docs

export const deepseekConfig = {
  // API 密钥 - 从环境变量读取
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  
  // API 基础 URL
  baseURL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
  
  // 默认模型
  model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  
  // 可用模型列表
  models: {
    // DeepSeek-V3 - 通用对话模型
    chat: 'deepseek-chat',
    // DeepSeek-R1 - 推理模型（适合数学、代码、逻辑推理）
    reasoner: 'deepseek-reasoner',
  } as const,
  
  // 默认请求参数
  defaults: {
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 0.9,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
  
  // 流式响应配置
  streaming: {
    enabled: true,
    chunkSize: 1024,
  },
}

// 验证配置
export function validateConfig(): { valid: boolean; error?: string } {
  if (!deepseekConfig.apiKey) {
    return { valid: false, error: 'DEEPSEEK_API_KEY 未设置' }
  }
  
  if (!deepseekConfig.apiKey.startsWith('sk-')) {
    return { valid: false, error: 'DEEPSEEK_API_KEY 格式不正确，应以 sk- 开头' }
  }
  
  return { valid: true }
}

// 获取模型名称
export function getModelName(type: 'chat' | 'reasoner' = 'chat'): string {
  return deepseekConfig.models[type] || deepseekConfig.model
}
