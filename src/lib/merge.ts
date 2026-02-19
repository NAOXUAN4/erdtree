// 分支语义合并工具函数

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
 * 生成合并提示
 * @param branchNodes 分支节点列表
 * @returns 合并提示
 */
export function generateMergePrompt(branchNodes: Node[]): string {
  // 提取分支的摘要或内容
  const branchContent = branchNodes
    .map(node => {
      if (node.summary) {
        return `[${node.role}] ${node.summary}`
      } else {
        return `[${node.role}] ${node.content}`
      }
    })
    .join('\n')
  
  // 生成合并提示
  const prompt = `用户在分支中探索了以下内容：\n\n${branchContent}\n\n请将此分支的核心结论作为一个事实陈述，整合进主干的当前上下文中。保持语言简洁明了，只包含最重要的信息。`
  
  return prompt
}

/**
 * 执行语义合并
 * @param branchId 分支 ID
 * @param targetNodeId 目标节点 ID
 * @param branchNodes 分支节点列表
 * @returns 合并结果
 */
export async function performSemanticMerge(
  branchId: string,
  targetNodeId: string,
  branchNodes: Node[]
): Promise<{
  success: boolean
  mergedContent?: string
  error?: string
}> {
  try {
    // 生成合并提示
    const prompt = generateMergePrompt(branchNodes)
    
    console.log('Generating merge content with prompt:', prompt)
    
    // 模拟 LLM 响应
    // 实际应用中会调用 LLM API 生成合并内容
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟生成的合并内容
    const mergedContent = `分支合并结果：基于分支 ${branchId} 的讨论，核心结论是...`
    
    return {
      success: true,
      mergedContent
    }
  } catch (error) {
    console.error('Error performing semantic merge:', error)
    return {
      success: false,
      error: '合并失败，请稍后重试'
    }
  }
}

/**
 * 获取分支的根节点
 * @param branchId 分支 ID
 * @param nodes 所有节点的映射
 * @returns 分支的根节点
 */
export function getBranchRoot(branchId: string, nodes: Map<string, Node>): Node | null {
  // 这里可以根据分支 ID 找到对应的根节点
  // 实际应用中会有更复杂的分支管理逻辑
  const node = nodes.get(branchId)
  if (node) {
    return node
  }
  return null
}

/**
 * 获取分支的所有节点
 * @param branchRootId 分支根节点 ID
 * @param nodes 所有节点的映射
 * @returns 分支的所有节点
 */
export function getBranchNodes(branchRootId: string, nodes: Map<string, Node>): Node[] {
  const branchNodes: Node[] = []
  const visited = new Set<string>()
  
  // 深度优先搜索获取分支的所有节点
  function dfs(nodeId: string) {
    if (visited.has(nodeId)) {
      return
    }
    
    visited.add(nodeId)
    const node = nodes.get(nodeId)
    if (node) {
      branchNodes.push(node)
      
      // 找到所有子节点
      Array.from(nodes.entries()).forEach(([id, potentialChild]) => {
        if (potentialChild.parent_id === nodeId) {
          dfs(id)
        }
      })
    }
  }
  
  dfs(branchRootId)
  return branchNodes
}
