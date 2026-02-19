// 摘要生成工具函数

/**
 * 生成对话摘要
 * @param messages 对话消息列表
 * @returns 生成的摘要
 */
export async function generateSummary(messages: Array<{
  role: string
  content: string
}>): Promise<string> {
  try {
    // 这里可以调用 LLM API 生成摘要
    // 实际应用中会使用 OpenAI 或 Claude API
    
    // 模拟摘要生成
    const prompt = `请为以下对话生成一个简洁的摘要：\n\n${messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')}\n\n摘要：`
    
    console.log('Generating summary with prompt:', prompt)
    
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟生成的摘要
    return `这是一个模拟的对话摘要，基于 ${messages.length} 条消息。`
  } catch (error) {
    console.error('Error generating summary:', error)
    return '无法生成摘要，请稍后重试。'
  }
}

/**
 * 计算消息的 Token 数
 * @param text 消息文本
 * @returns 估算的 Token 数
 */
export function calculateTokens(text: string): number {
  // 简单的 Token 估算方法
  // 实际应用中会使用更精确的 Token 计数器
  return Math.ceil(text.length / 4)
}

/**
 * 检查是否需要生成摘要
 * @param messages 对话消息列表
 * @param lastActivityTime 上次活动时间
 * @returns 是否需要生成摘要
 */
export function shouldGenerateSummary(
  messages: Array<{
    role: string
    content: string
  }>,
  lastActivityTime: Date
): boolean {
  // 检查闲置时间是否超过 30 分钟
  const idleTime = new Date().getTime() - lastActivityTime.getTime()
  const idleTimeMinutes = idleTime / (1000 * 60)
  
  if (idleTimeMinutes >= 30) {
    return true
  }
  
  // 检查 Token 数是否达到阈值
  const totalTokens = messages.reduce((sum, msg) => {
    return sum + calculateTokens(msg.content)
  }, 0)
  
  // Token 阈值设置为 1000
  if (totalTokens >= 1000) {
    return true
  }
  
  return false
}
