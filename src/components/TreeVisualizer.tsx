'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  NodeProps,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { GitBranch, Plus, User, Bot, Settings2 } from 'lucide-react'
import { useConversationStore } from '@/store/useConversationStore'
import { useTranslation } from '@/lib/i18n'
import BranchDialog from './BranchDialog'
import MarkdownRenderer from './MarkdownRenderer'

// 自定义节点组件
const ConversationNode = ({ data, selected }: NodeProps) => {
  const isUser = data.role === 'user'
  const isSystem = data.role === 'system'
  
  const getRoleIcon = () => {
    if (isUser) return <User className="w-3 h-3" />
    if (isSystem) return <Settings2 className="w-3 h-3" />
    return <Bot className="w-3 h-3" />
  }
  
  return (
    <div
      className={`min-w-[200px] max-w-[320px] rounded-lg border transition-all ${
        selected
          ? 'border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100'
          : 'border-zinc-200 dark:border-zinc-700'
      } ${
        isUser
          ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900'
          : isSystem
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
          : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-zinc-400 dark:!bg-zinc-500 !border-0" />
      
      <div className={`px-3 py-2 border-b flex items-center justify-between ${
        isUser 
          ? 'border-zinc-700 dark:border-zinc-200/20' 
          : 'border-zinc-200/50 dark:border-zinc-700/50'
      }`}>
        <div className="flex items-center space-x-1.5">
          <span className={isUser ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400 dark:text-zinc-500'}>{getRoleIcon()}</span>
          <span className="text-[10px] font-medium opacity-70">
            {isUser ? '用户' : isSystem ? '系统' : '助手'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div 
            className="w-1.5 h-1.5 rounded-full" 
            style={{ backgroundColor: data.branchColor }}
          />
          <span className="text-[10px] opacity-60">{data.branchName}</span>
        </div>
      </div>
      
      <div className="px-3 py-2">
        <div className="text-xs line-clamp-4">
          {isUser ? (
            <p className="whitespace-pre-wrap">{data.content || '(空)'}</p>
          ) : (
            <MarkdownRenderer 
              content={data.content || '(空)'} 
              className={isUser ? 'prose-invert' : ''}
            />
          )}
        </div>
      </div>
      
      <div className={`px-3 py-1.5 border-t flex items-center justify-between ${
        isUser 
          ? 'border-zinc-700 dark:border-zinc-200/20' 
          : 'border-zinc-200/50 dark:border-zinc-700/50'
      }`}>
        <span className="text-[10px] opacity-40">
          {new Date(data.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-zinc-400 dark:!bg-zinc-500 !border-0" />
    </div>
  )
}

const nodeTypes = {
  conversation: ConversationNode,
}

const TreeVisualizer = () => {
  const { 
    messages, 
    branches,
    selectedNodeId,
    selectNode,
    createBranch,
    getAllNodes,
    initConversation,
  } = useConversationStore()
  
  const { t } = useTranslation()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogDefaultName, setDialogDefaultName] = useState('')

  useEffect(() => {
    const state = useConversationStore.getState()
    if (Object.keys(state.messages).length === 0) {
      initConversation()
    }
  }, [initConversation])

  // 构建树形布局
  const layoutNodes = useMemo(() => {
    const allNodes = getAllNodes()
    const allMessages = Object.values(messages).sort((a, b) => a.timestamp - b.timestamp)
    
    const nodeWidth = 280
    const nodeHeight = 140
    const levelGap = 320
    const siblingGap = 160
    
    // 构建父子关系图
    const childrenMap: Record<string, string[]> = {}
    const parentMap: Record<string, string> = {}
    
    allMessages.forEach(msg => {
      if (msg.parentId) {
        if (!childrenMap[msg.parentId]) childrenMap[msg.parentId] = []
        childrenMap[msg.parentId].push(msg.id)
        parentMap[msg.id] = msg.parentId
      }
    })
    
    // 计算每个节点的层级（深度）
    const depthMap: Record<string, number> = {}
    const calculateDepth = (nodeId: string, visited: Set<string> = new Set()): number => {
      if (visited.has(nodeId)) return 0
      if (depthMap[nodeId] !== undefined) return depthMap[nodeId]
      visited.add(nodeId)
      
      const parentId = parentMap[nodeId]
      if (!parentId) {
        depthMap[nodeId] = 0
        return 0
      }
      
      depthMap[nodeId] = calculateDepth(parentId, visited) + 1
      return depthMap[nodeId]
    }
    
    allMessages.forEach(msg => calculateDepth(msg.id))
    
    // 按层级分组
    const nodesByDepth: Record<number, string[]> = {}
    Object.entries(depthMap).forEach(([nodeId, depth]) => {
      if (!nodesByDepth[depth]) nodesByDepth[depth] = []
      nodesByDepth[depth].push(nodeId)
    })
    
    // 计算位置 - 使用简单的层级布局
    const positions: Record<string, { x: number; y: number }> = {}
    
    Object.entries(nodesByDepth).forEach(([depthStr, nodeIds]) => {
      const depth = parseInt(depthStr)
      const count = nodeIds.length
      const totalHeight = count * siblingGap
      const startY = -totalHeight / 2 + siblingGap / 2
      
      nodeIds.forEach((nodeId, index) => {
        // 如果有父节点，尽量靠近父节点的Y位置
        const parentId = parentMap[nodeId]
        let y = startY + index * siblingGap
        
        if (parentId && positions[parentId]) {
          const parentY = positions[parentId].y
          const siblings = childrenMap[parentId] || []
          const siblingIndex = siblings.indexOf(nodeId)
          const siblingCount = siblings.length
          
          if (siblingCount > 1) {
            const spread = Math.min(siblingGap * (siblingCount - 1), 400)
            const siblingStartY = parentY - spread / 2
            y = siblingStartY + siblingIndex * (spread / (siblingCount - 1))
          } else {
            y = parentY
          }
        }
        
        positions[nodeId] = {
          x: depth * levelGap + 50,
          y: y,
        }
      })
    })
    
    return { allNodes, positions }
  }, [messages, getAllNodes])

  // 生成 ReactFlow 节点和边
  useEffect(() => {
    const { allNodes, positions } = layoutNodes
    
    const rfNodes: Node[] = allNodes.map(node => {
      const msg = node.message
      const branch = branches[msg.branchId]
      const pos = positions[node.id] || { x: 0, y: 0 }
      
      return {
        id: node.id,
        type: 'conversation',
        position: pos,
        data: {
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp,
          branchName: branch?.name || 'unknown',
          branchColor: branch?.color || '#18181b',
        },
        selected: selectedNodeId === node.id,
      }
    })

    // 创建边 - 使用更细的线条
    const rfEdges: Edge[] = []
    allNodes.forEach(node => {
      if (node.message.parentId && messages[node.message.parentId]) {
        const parentMsg = messages[node.message.parentId]
        const isBranchPoint = parentMsg.branchId !== node.message.branchId
        const branch = branches[node.message.branchId]
        
        rfEdges.push({
          id: `e-${node.message.parentId}-${node.id}`,
          source: node.message.parentId,
          target: node.id,
          type: 'smoothstep',
          animated: isBranchPoint,
          style: {
            stroke: branch?.color || '#a1a1aa',
            strokeWidth: isBranchPoint ? 2 : 1.5,
          },

        })
      }
    })

    setNodes(rfNodes)
    setEdges(rfEdges)
  }, [layoutNodes, branches, messages, selectedNodeId, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id)
  }, [selectNode])

  const handleOpenCreateBranch = useCallback(() => {
    if (selectedNodeId) {
      setDialogDefaultName(`branch-${Object.keys(branches).length}`)
      setDialogOpen(true)
    }
  }, [selectedNodeId, branches])
  
  const handleConfirmCreateBranch = useCallback((name: string) => {
    if (selectedNodeId) {
      createBranch(selectedNodeId, name)
    }
  }, [selectedNodeId, createBranch])

  return (
    <>
      <div className="h-full bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        {/* 工具栏 */}
        <div className="px-4 py-2.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t('tree.emptyTitle')}</span>
          </div>
          <button
            onClick={handleOpenCreateBranch}
            disabled={!selectedNodeId}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('sidebar.newBranch')}</span>
          </button>
        </div>
        
        {/* ReactFlow 画布 */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            attributionPosition="bottom-left"
            minZoom={0.3}
            maxZoom={1.5}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: '#a1a1aa', strokeWidth: 1.5 },
            }}
          >
            <Controls className="!bg-white dark:!bg-zinc-800 !border-zinc-200 dark:!border-zinc-700 !shadow-sm [&_button]:!bg-white dark:[&_button]:!bg-zinc-800 [&_button]:!border-zinc-200 dark:[&_button]:!border-zinc-700 [&_button:hover]:!bg-zinc-100 dark:[&_button:hover]:!bg-zinc-700 [&_svg]:!fill-zinc-700 dark:[&_svg]:!fill-zinc-300" />
            <MiniMap 
              className="!bg-white dark:!bg-zinc-800 !border-zinc-200 dark:!border-zinc-700 !rounded-lg !shadow-sm"
              nodeStrokeWidth={2}
              nodeColor={(node) => {
                return node.data?.branchColor || '#18181b'
              }}
              zoomable
              pannable
            />
            <Background 
              gap={20} 
              size={1} 
              color="#e4e4e7"
              className="dark:!bg-zinc-950"
            />
          </ReactFlow>
        </div>
      </div>
      
      <BranchDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmCreateBranch}
        defaultName={dialogDefaultName}
      />
    </>
  )
}

export default TreeVisualizer
