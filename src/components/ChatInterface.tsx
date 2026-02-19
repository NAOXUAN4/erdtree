'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, AlertCircle, CornerDownLeft } from 'lucide-react'
import { useConversationStore } from '@/store/useConversationStore'
import { chatStreamFetch, ChatMessage } from '@/lib/llm'
import MarkdownRenderer from './MarkdownRenderer'

const ChatInterface = () => {
  const {
    messages,
    currentMessageChain,
    activeBranchId,
    branches,
    addMessage,
    initConversation,
  } = useConversationStore()

  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const state = useConversationStore.getState()
    if (Object.keys(state.messages).length === 0) {
      initConversation()
    }
  }, [initConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessageChain, streamingContent])

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeBranchId])

  const currentMessages = currentMessageChain
    .map(id => messages[id])
    .filter(Boolean)

  const currentBranch = branches[activeBranchId]

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    setApiError(null)
    const userMessageId = addMessage(inputMessage, 'user')
    setInputMessage('')
    setIsLoading(true)
    setStreamingContent('')

    try {
      const apiMessages: ChatMessage[] = [
        {
          role: 'system',
          content: '你是一个有帮助的 AI 助手。请用中文回答用户的问题。',
        },
        ...currentMessages
          .filter(m => m.role !== 'system')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        {
          role: 'user',
          content: inputMessage,
        },
      ]

      const stream = await chatStreamFetch(apiMessages, {
        temperature: 0.7,
        max_tokens: 4096,
      })

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              // DeepSeek/OpenAI 流式格式: choices[0].delta.content
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                fullContent += content
                setStreamingContent(fullContent)
              }
            } catch {
              // ignore
            }
          }
        }
      }

      addMessage(fullContent, 'assistant')
      setStreamingContent('')

    } catch (error) {
      console.error('Error sending message:', error)
      setApiError(error instanceof Error ? error.message : '发送消息失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Branch indicator */}
      <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center space-x-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: currentBranch?.color || '#18181b' }}
          />
          <span className="text-xs font-medium text-zinc-700">
            {currentBranch?.name || 'main'}
          </span>
          <span className="text-xs text-zinc-400">
            {currentMessages.filter(m => m.role !== 'system').length} 消息
          </span>
        </div>
      </div>

      {/* Error message */}
      {apiError && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-100 rounded-md flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-red-700">请求失败</p>
            <p className="text-xs text-red-600 mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {currentMessages.length === 0 || (currentMessages.length === 1 && currentMessages[0].role === 'system') ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400">
            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center mb-3">
              <CornerDownLeft className="w-4 h-4" />
            </div>
            <p className="text-sm text-zinc-500">开始对话</p>
            <p className="text-xs text-zinc-400 mt-1">输入消息与 AI 助手交流</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {currentMessages
              .filter(m => m.role !== 'system')
              .map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-zinc-900 text-zinc-50'
                          : 'bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <MarkdownRenderer content={message.content} />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 px-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            
            {streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="px-4 py-2.5 rounded-2xl bg-zinc-100 text-zinc-800 text-sm leading-relaxed">
                    <MarkdownRenderer content={streamingContent} />
                  </div>
                  <div className="flex space-x-1 mt-2 ml-1">
                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-pulse" />
                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-pulse delay-100" />
                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
            
            {isLoading && !streamingContent && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-zinc-100">
                  <div className="flex space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-zinc-200 p-4 bg-white">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            disabled={isLoading}
            rows={1}
            className="w-full pr-12 pl-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 disabled:opacity-50 transition-all"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 text-zinc-50 rounded-lg hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 text-center mt-2">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  )
}

export default ChatInterface
