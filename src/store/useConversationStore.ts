import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 消息类型
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  parentId: string | null
  branchId: string
}

// 分支类型
export interface Branch {
  id: string
  name: string
  parentBranchId: string | null
  parentMessageId: string | null
  createdAt: number
  color: string
}

// 对话节点（用于树状显示）
export interface ConversationNode {
  id: string
  message: Message
  children: string[]
  depth: number
  branchId: string
}

interface ConversationState {
  // 所有消息
  messages: Record<string, Message>
  // 所有分支
  branches: Record<string, Branch>
  // 当前活跃分支
  activeBranchId: string
  // 当前选中的消息节点
  selectedNodeId: string | null
  // 根消息ID
  rootMessageId: string | null
  // 当前分支的消息链
  currentMessageChain: string[]
  
  // Actions
  // 初始化对话
  initConversation: () => void
  // 添加消息
  addMessage: (content: string, role: 'user' | 'assistant') => string
  // 创建新分支
  createBranch: (fromMessageId: string, name?: string) => string
  // 切换分支
  switchBranch: (branchId: string) => void
  // 选择节点（跳转到该节点的上下文）
  selectNode: (messageId: string) => void
  // 获取消息链（从根到指定消息）
  getMessageChain: (messageId: string) => Message[]
  // 获取分支的所有消息
  getBranchMessages: (branchId: string) => Message[]
  // 获取所有分支
  getAllBranches: () => Branch[]
  // 重命名分支
  renameBranch: (branchId: string, newName: string) => void
  // 删除分支
  deleteBranch: (branchId: string) => void
  // 获取节点的所有子节点（用于树状显示）
  getNodeChildren: (messageId: string) => string[]
  // 获取所有节点（用于 Git Graph 渲染）
  getAllNodes: () => ConversationNode[]
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// 分支颜色池
const branchColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      messages: {},
      branches: {},
      activeBranchId: '',
      selectedNodeId: null,
      rootMessageId: null,
      currentMessageChain: [],

      initConversation: () => {
        const rootBranchId = generateId()
        const rootMessageId = generateId()
        
        const rootMessage: Message = {
          id: rootMessageId,
          role: 'system',
          content: '',
          timestamp: Date.now(),
          parentId: null,
          branchId: rootBranchId,
        }

        const rootBranch: Branch = {
          id: rootBranchId,
          name: 'main',
          parentBranchId: null,
          parentMessageId: null,
          createdAt: Date.now(),
          color: branchColors[0],
        }

        set({
          messages: { [rootMessageId]: rootMessage },
          branches: { [rootBranchId]: rootBranch },
          activeBranchId: rootBranchId,
          rootMessageId: rootMessageId,
          currentMessageChain: [rootMessageId],
        })
      },

      addMessage: (content, role) => {
        const state = get()
        const messageId = generateId()
        const parentId = state.currentMessageChain[state.currentMessageChain.length - 1] || null

        const message: Message = {
          id: messageId,
          role,
          content,
          timestamp: Date.now(),
          parentId,
          branchId: state.activeBranchId,
        }

        set((state) => ({
          messages: { ...state.messages, [messageId]: message },
          currentMessageChain: [...state.currentMessageChain, messageId],
        }))

        return messageId
      },

      createBranch: (fromMessageId, name) => {
        const state = get()
        const branchId = generateId()
        const parentMessage = state.messages[fromMessageId]
        
        if (!parentMessage) return ''

        // 获取父分支
        const parentBranch = state.branches[parentMessage.branchId]
        
        // 选择新分支颜色
        const usedColors = Object.values(state.branches).map(b => b.color)
        const availableColors = branchColors.filter(c => !usedColors.includes(c))
        const color = availableColors.length > 0 
          ? availableColors[0] 
          : branchColors[Object.keys(state.branches).length % branchColors.length]

        const newBranch: Branch = {
          id: branchId,
          name: name || `branch-${Object.keys(state.branches).length}`,
          parentBranchId: parentMessage.branchId,
          parentMessageId: fromMessageId,
          createdAt: Date.now(),
          color,
        }

        set((state) => ({
          branches: { ...state.branches, [branchId]: newBranch },
          activeBranchId: branchId,
        }))

        // 构建新分支的消息链（继承父分支到分叉点的历史）
        const parentChain = state.getMessageChain(fromMessageId)
        set((state) => ({
          currentMessageChain: parentChain.map(m => m.id),
        }))

        return branchId
      },

      switchBranch: (branchId) => {
        const state = get()
        const branch = state.branches[branchId]
        if (!branch) return

        // 构建该分支的完整消息链
        const chain: string[] = []
        
        // 如果有父分支，先获取父分支到分叉点的链
        if (branch.parentMessageId) {
          const parentChain = state.getMessageChain(branch.parentMessageId)
          chain.push(...parentChain.map(m => m.id))
        }

        // 添加当前分支的消息
        const branchMessages = Object.values(state.messages)
          .filter(m => m.branchId === branchId)
          .sort((a, b) => a.timestamp - b.timestamp)
        
        chain.push(...branchMessages.map(m => m.id))

        set({
          activeBranchId: branchId,
          currentMessageChain: chain,
        })
      },

      selectNode: (messageId) => {
        const state = get()
        const message = state.messages[messageId]
        if (!message) return

        // 切换到该消息所在分支
        if (message.branchId !== state.activeBranchId) {
          state.switchBranch(message.branchId)
        }

        // 截断到该消息的链
        const chain = state.getMessageChain(messageId)
        set({
          selectedNodeId: messageId,
          currentMessageChain: chain.map(m => m.id),
        })
      },

      getMessageChain: (messageId) => {
        const state = get()
        const chain: Message[] = []
        let currentId: string | null = messageId

        while (currentId) {
          const msg: Message | undefined = state.messages[currentId]
          if (msg) {
            chain.unshift(msg)
            currentId = msg.parentId
          } else {
            break
          }
        }

        return chain
      },

      getBranchMessages: (branchId) => {
        const state = get()
        return Object.values(state.messages)
          .filter(m => m.branchId === branchId)
          .sort((a, b) => a.timestamp - b.timestamp)
      },

      getAllBranches: () => {
        const state = get()
        return Object.values(state.branches).sort((a, b) => a.createdAt - b.createdAt)
      },

      renameBranch: (branchId, newName) => {
        set((state) => ({
          branches: {
            ...state.branches,
            [branchId]: { ...state.branches[branchId], name: newName },
          },
        }))
      },

      deleteBranch: (branchId) => {
        const state = get()
        if (branchId === state.activeBranchId) {
          // 不能删除当前活跃分支，先切换到 main
          const mainBranch = Object.values(state.branches).find(b => b.name === 'main')
          if (mainBranch) {
            state.switchBranch(mainBranch.id)
          }
        }

        // 删除分支及其所有消息
        const messagesToDelete = Object.values(state.messages)
          .filter(m => m.branchId === branchId)
          .map(m => m.id)

        set((state) => {
          const newMessages = { ...state.messages }
          messagesToDelete.forEach(id => delete newMessages[id])
          
          const newBranches = { ...state.branches }
          delete newBranches[branchId]

          return {
            messages: newMessages,
            branches: newBranches,
          }
        })
      },

      getNodeChildren: (messageId) => {
        const state = get()
        return Object.values(state.messages)
          .filter(m => m.parentId === messageId)
          .map(m => m.id)
      },

      getAllNodes: () => {
        const state = get()
        const nodes: ConversationNode[] = []
        
        // 计算每个节点的深度
        const calculateDepth = (messageId: string, visited: Set<string> = new Set()): number => {
          if (visited.has(messageId)) return 0
          visited.add(messageId)
          
          const message = state.messages[messageId]
          if (!message || !message.parentId) return 0
          
          return calculateDepth(message.parentId, visited) + 1
        }

        Object.values(state.messages).forEach(message => {
          nodes.push({
            id: message.id,
            message,
            children: state.getNodeChildren(message.id),
            depth: calculateDepth(message.id),
            branchId: message.branchId,
          })
        })

        return nodes.sort((a, b) => a.message.timestamp - b.message.timestamp)
      },
    }),
    {
      name: 'erdtree-conversation',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
