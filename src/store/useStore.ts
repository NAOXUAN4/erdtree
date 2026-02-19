import { create } from 'zustand'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface StoreState {
  // 当前选中的节点
  selectedNodeId: string | null
  // 对话历史
  messages: Message[]
  // 加载状态
  isLoading: boolean
  // 设置选中的节点
  setSelectedNodeId: (nodeId: string | null) => void
  // 加载节点对应的对话历史
  loadNodeHistory: (nodeId: string) => Promise<void>
  // 添加消息
  addMessage: (message: Message) => void
  // 设置加载状态
  setIsLoading: (isLoading: boolean) => void
}

export const useStore = create<StoreState>((set, get) => ({
  selectedNodeId: null,
  messages: [],
  isLoading: false,

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  loadNodeHistory: async (nodeId) => {
    set({ isLoading: true })
    
    try {
      // 模拟从后端加载节点对应的对话历史
      // 实际应用中会调用 API 获取数据
      setTimeout(() => {
        const mockMessages: Message[] = [
          {
            id: '1',
            role: 'system',
            content: '你是 ErdTree，一个智能对话助手。',
            timestamp: new Date(),
          },
          {
            id: '2',
            role: 'assistant',
            content: '你好！我是 ErdTree，一个支持树状对话结构的智能助手。',
            timestamp: new Date(),
          },
          {
            id: nodeId,
            role: 'user',
            content: `这是节点 ${nodeId} 对应的对话内容。`,
            timestamp: new Date(),
          },
        ]
        
        set({ 
          messages: mockMessages,
          selectedNodeId: nodeId,
          isLoading: false 
        })
      }, 500)
    } catch (error) {
      console.error('Error loading node history:', error)
      set({ isLoading: false })
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  setIsLoading: (isLoading) => set({ isLoading }),
}))
