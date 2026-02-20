'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  GitBranch,
  Plus,
  Download,
  RotateCcw,
  Bot,
  User,
  Settings2
} from 'lucide-react'
import { useConversationStore } from '@/store/useConversationStore'
import { useTranslation } from '@/lib/i18n'
import BranchDialog from './BranchDialog'

interface GraphNode {
  id: string
  x: number
  y: number
  color: string
  message: string
  role: 'user' | 'assistant' | 'system'
  branchId: string
  branchName: string
  hasChildren: boolean
}

interface GraphEdge {
  from: { x: number; y: number }
  to: { x: number; y: number }
  color: string
  type: 'straight' | 'curve'
}

const GitGraphSidebar = () => {
  const {
    messages,
    branches,
    activeBranchId,
    selectedNodeId,
    initConversation,
    selectNode,
    createBranch,
    getAllBranches,
  } = useConversationStore()

  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogDefaultName, setDialogDefaultName] = useState('')
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const state = useConversationStore.getState()
    if (Object.keys(state.messages).length === 0) {
      initConversation()
    }
  }, [initConversation])

  const { nodes, edges, height } = useMemo(() => {
    const nodeList: GraphNode[] = []
    const edgeList: GraphEdge[] = []

    const allMessages = Object.values(messages).sort((a, b) => a.timestamp - b.timestamp)
    const allBranches = getAllBranches()

    const branchColumns: Record<string, number> = {}
    let currentColumn = 0

    const mainBranch = allBranches.find(b => b.name === 'main')
    if (mainBranch) {
      branchColumns[mainBranch.id] = 0
      currentColumn = 1
    }

    allBranches.forEach(branch => {
      if (branch.name !== 'main') {
        branchColumns[branch.id] = currentColumn++
      }
    })

    const columnWidth = 36
    const rowHeight = 44
    const startX = 24
    const startY = 24

    const messagePositions: Record<string, { x: number; y: number }> = {}

    allMessages.forEach((msg, index) => {
      const column = branchColumns[msg.branchId] ?? 0
      const x = startX + column * columnWidth
      const y = startY + index * rowHeight

      messagePositions[msg.id] = { x, y }

      const branch = branches[msg.branchId]
      nodeList.push({
        id: msg.id,
        x,
        y,
        color: branch?.color || '#18181b',
        message: msg.content.slice(0, 24) + (msg.content.length > 24 ? '...' : ''),
        role: msg.role,
        branchId: msg.branchId,
        branchName: branch?.name || 'main',
        hasChildren: false,
      })

      if (msg.parentId && messagePositions[msg.parentId]) {
        const parentPos = messagePositions[msg.parentId]
        const parentBranch = allMessages.find(m => m.id === msg.parentId)?.branchId
        const parentBranchColor = parentBranch ? branches[parentBranch]?.color : '#18181b'

        edgeList.push({
          from: parentPos,
          to: { x, y },
          color: parentBranchColor || '#18181b',
          type: msg.branchId === parentBranch ? 'straight' : 'curve',
        })
      }
    })

    return {
      nodes: nodeList,
      edges: edgeList,
      height: Math.max(400, startY + allMessages.length * rowHeight + 40)
    }
  }, [messages, branches, getAllBranches])

  const handleOpenCreateBranch = (messageId: string) => {
    const branchCount = Object.keys(branches).length
    setDialogDefaultName(`branch-${branchCount}`)
    setPendingMessageId(messageId)
    setDialogOpen(true)
  }

  const handleConfirmCreateBranch = (name: string) => {
    if (pendingMessageId) {
      createBranch(pendingMessageId, name)
    }
  }

  const renderEdge = (edge: GraphEdge, index: number) => {
    if (edge.type === 'curve') {
      const midY = (edge.from.y + edge.to.y) / 2
      const path = `M ${edge.from.x} ${edge.from.y} C ${edge.from.x} ${midY}, ${edge.to.x} ${midY}, ${edge.to.x} ${edge.to.y}`
      return (
        <path
          key={index}
          d={path}
          fill="none"
          stroke={edge.color}
          strokeWidth={2}
          opacity={0.4}
        />
      )
    } else {
      return (
        <line
          key={index}
          x1={edge.from.x}
          y1={edge.from.y}
          x2={edge.to.x}
          y2={edge.to.y}
          stroke={edge.color}
          strokeWidth={2}
          opacity={0.4}
        />
      )
    }
  }

  const allBranches = getAllBranches()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user': return <User className="w-3 h-3" />
      case 'assistant': return <Bot className="w-3 h-3" />
      default: return <Settings2 className="w-3 h-3" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user': return t('roles.user')
      case 'assistant': return t('roles.assistant')
      default: return t('roles.system')
    }
  }

  // 防止 hydration 不匹配，服务端渲染时返回简化版本
  if (!mounted) {
    return (
      <div className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('sidebar.branches')}</span>
          </div>
        </div>
        <div className="flex-1 bg-zinc-50/30 dark:bg-zinc-900/30" />
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 bg-white dark:bg-zinc-900">
          <div className="w-full h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
          <div className="flex space-x-2">
            <div className="flex-1 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
            <div className="flex-1 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('sidebar.branches')}</span>
          </div>
        </div>

        {/* Branch list */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-0.5 max-h-36 overflow-y-auto">
            {allBranches.map(branch => (
              <div
                key={branch.id}
                className={`flex items-center px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                  activeBranchId === branch.id
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
                onClick={() => useConversationStore.getState().switchBranch(branch.id)}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mr-2"
                  style={{ backgroundColor: branch.color }}
                />
                <span className="flex-1 truncate font-medium">{branch.name}</span>
                {activeBranchId === branch.id && (
                  <div className="w-1 h-1 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Git Graph */}
        <div className="flex-1 overflow-auto bg-zinc-50/30 dark:bg-zinc-900/30">
          <svg width="100%" height={height} className="min-w-full">
            {edges.map((edge, index) => renderEdge(edge, index))}

            {nodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={selectedNodeId === node.id ? 6 : 4}
                  fill={node.color}
                  stroke={selectedNodeId === node.id ? '#18181b' : 'white'}
                  strokeWidth={selectedNodeId === node.id ? 2 : 1.5}
                  className="cursor-pointer transition-all"
                  onClick={() => selectNode(node.id)}
                />

                <foreignObject
                  x={node.x + 12}
                  y={node.y - 10}
                  width="160"
                  height="32"
                >
                  <div
                    className={`flex items-center space-x-1.5 text-xs truncate cursor-pointer transition-colors ${
                      selectedNodeId === node.id
                        ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                    onClick={() => selectNode(node.id)}
                    title={`${node.branchName}: ${node.message}`}
                  >
                    <span className="text-zinc-400 dark:text-zinc-500">
                      {getRoleIcon(node.role)}
                    </span>
                    <span className="truncate">{node.message || '(empty)'}</span>
                  </div>
                </foreignObject>

                {node.role === 'assistant' && (
                  <foreignObject
                    x={node.x - 6}
                    y={node.y + 8}
                    width="16"
                    height="16"
                  >
                    <button
                      className="w-3.5 h-3.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenCreateBranch(node.id)
                      }}
                      title={t('branch.createFromHere')}
                    >
                      <Plus className="w-2.5 h-2.5 text-zinc-500 dark:text-zinc-400" />
                    </button>
                  </foreignObject>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 bg-white dark:bg-zinc-900">
          <button
            className="w-full flex items-center justify-center space-x-1.5 text-xs bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 py-2 px-3 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40"
            onClick={() => {
              if (selectedNodeId) {
                handleOpenCreateBranch(selectedNodeId)
              }
            }}
            disabled={!selectedNodeId}
            title={!selectedNodeId ? t('sidebar.selectNodeHint') : ''}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('sidebar.newBranch')}</span>
          </button>
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center space-x-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-2 px-3 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>{t('sidebar.export')}</span>
            </button>
            <button
              className="flex-1 flex items-center justify-center space-x-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-2 px-3 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              onClick={() => {
                if (confirm('Clear all conversations?')) {
                  initConversation()
                }
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('sidebar.reset')}</span>
            </button>
          </div>
        </div>
      </div>

      <BranchDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setPendingMessageId(null)
        }}
        onConfirm={handleConfirmCreateBranch}
        defaultName={dialogDefaultName}
      />
    </>
  )
}

export default GitGraphSidebar
