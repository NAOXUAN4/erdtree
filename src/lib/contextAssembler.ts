// 上下文组装器工具函数

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface Node {
  id: string
  project_id: string
  parent_id: string | null
  role: 'user' | 'assistant' | 'system_note'
  content: string
  summary?: string
  tokens_count?: number
  embedding?: number[]
  is_checkpoint?: boolean
  branch_name?: string
}

/**
 * 回溯路径计算
 * @param nodeId 当前节点 ID
 * @param nodes 所有节点的映射
 * @returns 从根节点到当前节点的路径
 */
export function getPathFromRoot(nodeId: string, nodes: Map<string, Node>): Node[] {
  const path: Node[] = []
  let currentNode = nodes.get(nodeId)
  
  while (currentNode) {
    path.unshift(currentNode)
    if (!currentNode.parent_id) {
      break
    }
    currentNode = nodes.get(currentNode.parent_id)
  }
  
  return path
}

/**
 * 动态剪枝
 * @param path 从根节点到当前节点的路径
 * @param k 保留最近的原始消息节点数
 * @returns 剪枝后的消息列表
 */
export function dynamicPruning(path: Node[], k: number = 5): Array<{
  role: string
  content: string
}> {
  const messages: Array<{
    role: string
    content: string
  }> = []
  
  // 保留系统提示
  const systemNode = path.find(node => node.role === 'system_note')
  if (systemNode) {
    messages.push({
      role: 'system',
      content: systemNode.content
    })
  }
  
  // 保留最近的 K 个原始消息节点
  const recentNodes = path.slice(-k)
  
  // 处理中间节点
  for (let i = 0; i < path.length; i++) {
    const node = path[i]
    
    // 跳过系统节点（已经处理过）
    if (node.role === 'system_note') {
      continue
    }
    
    // 如果是最近的 K 个节点，保留原始内容
    if (recentNodes.includes(node)) {
      messages.push({
        role: node.role,
        content: node.content
      })
    } else if (node.summary) {
      // 如果不是最近的节点，但有摘要，使用摘要
      messages.push({
        role: 'assistant',
        content: `[摘要] ${node.summary}`
      })
    }
  }
  
  return messages
}

/**
 * 计算查询向量
 * @param query 查询文本
 * @returns 向量表示
 */
export function calculateEmbedding(query: string): number[] {
  // 简单的向量计算方法
  // 实际应用中会调用 Embedding API
  const vector: number[] = []
  for (let i = 0; i < 1536; i++) {
    vector.push(Math.random() * 2 - 1)
  }
  return vector
}

/**
 * 搜索相关节点
 * @param query 查询文本
 * @param nodes 所有节点
 * @param topK 返回前 K 个相关节点
 * @returns 相关节点列表
 */
export function searchRelevantNodes(
  query: string,
  nodes: Node[],
  topK: number = 3
): Node[] {
  // 计算查询向量
  const queryEmbedding = calculateEmbedding(query)
  
  // 计算每个节点与查询的相似度
  const nodesWithSimilarity = nodes.map(node => {
    if (!node.embedding) {
      return { node, similarity: 0 }
    }
    
    // 计算余弦相似度
    const similarity = calculateCosineSimilarity(queryEmbedding, node.embedding)
    return { node, similarity }
  })
  
  // 按相似度排序并返回前 K 个
  return nodesWithSimilarity
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(item => item.node)
}

/**
 * 计算余弦相似度
 * @param vector1 向量1
 * @param vector2 向量2
 * @returns 相似度
 */
function calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length')
  }
  
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0
  
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i]
    magnitude1 += vector1[i] * vector1[i]
    magnitude2 += vector2[i] * vector2[i]
  }
  
  magnitude1 = Math.sqrt(magnitude1)
  magnitude2 = Math.sqrt(magnitude2)
  
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0
  }
  
  return dotProduct / (magnitude1 * magnitude2)
}

/**
 * 组装上下文
 * @param currentNodeId 当前节点 ID
 * @param nodes 所有节点的映射
 * @param query 当前查询
 * @returns 组装好的上下文消息列表
 */
export function assembleContext(
  currentNodeId: string,
  nodes: Map<string, Node>,
  query: string
): Array<{
  role: string
  content: string
}> {
  // 1. 回溯路径
  const path = getPathFromRoot(currentNodeId, nodes)
  
  // 2. 动态剪枝
  const prunedMessages = dynamicPruning(path)
  
  // 3. 搜索相关节点
  const allNodes = Array.from(nodes.values())
  const relevantNodes = searchRelevantNodes(query, allNodes)
  
  // 4. 构建最终上下文
  const finalContext = [...prunedMessages]
  
  // 添加相关节点作为参考
  if (relevantNodes.length > 0) {
    finalContext.push({
      role: 'system',
      content: '以下是相关的历史对话片段，仅供参考：\n' + 
        relevantNodes.map(node => `[${node.role}] ${node.content}`).join('\n')
    })
  }
  
  return finalContext
}
