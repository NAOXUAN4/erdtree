'use client'

import { useState, useEffect } from 'react'
import { GitBranch, X } from 'lucide-react'

interface BranchDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string) => void
  defaultName: string
}

const BranchDialog = ({ isOpen, onClose, onConfirm, defaultName }: BranchDialogProps) => {
  const [name, setName] = useState(defaultName)

  useEffect(() => {
    if (isOpen) {
      setName(defaultName)
    }
  }, [isOpen, defaultName])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-zinc-950/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-5 w-80 border border-zinc-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-900">新建分支</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="分支名称"
          className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              onConfirm(name.trim())
              onClose()
            }
          }}
        />
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onConfirm(name.trim())
                onClose()
              }
            }}
            disabled={!name.trim()}
            className="px-3 py-1.5 text-xs font-medium bg-zinc-900 text-zinc-50 rounded-md hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}

export default BranchDialog
