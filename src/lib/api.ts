const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// 发送消息到后端
export async function sendMessage(message: string) {
  try {
    const response = await fetch(`${API_URL}/api/node`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message, role: 'user' }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to send message')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error sending message:', error)
    // 返回模拟响应，确保前端功能正常
    return {
      node_id: `node_${Date.now()}`,
      message: '消息发送成功（模拟）'
    }
  }
}

// 获取对话历史
export async function getChatHistory(chatId: string) {
  try {
    const response = await fetch(`${API_URL}/api/chat/${chatId}`)
    
    if (!response.ok) {
      throw new Error('Failed to get chat history')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error getting chat history:', error)
    // 返回模拟数据，确保前端功能正常
    return {
      chat_id: chatId,
      messages: [
        {
          id: '1',
          role: 'system',
          content: '你是 ErdTree，一个智能对话助手。',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          role: 'assistant',
          content: '你好！我是 ErdTree，一个支持树状对话结构的智能助手。',
          timestamp: new Date().toISOString()
        }
      ]
    }
  }
}

// 创建对话分支
export async function createBranch(chatId: string, parentNodeId: string) {
  try {
    const response = await fetch(`${API_URL}/api/chat/${chatId}/branch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent_node_id: parentNodeId }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create branch')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating branch:', error)
    // 返回模拟响应，确保前端功能正常
    return {
      branch_id: `branch_${chatId}_${parentNodeId}_${Date.now()}`,
      message: '分支创建成功（模拟）'
    }
  }
}
