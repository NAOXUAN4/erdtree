'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-lg font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2 text-zinc-900 dark:text-zinc-100">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100">{children}</h3>,
          p: ({ children }) => <p className="mb-2 leading-relaxed text-zinc-700 dark:text-zinc-300">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5 text-zinc-700 dark:text-zinc-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5 text-zinc-700 dark:text-zinc-300">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          code: ({ children, className }) => {
            const isInline = !className
            return isInline ? (
              <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded text-xs font-mono border border-zinc-200 dark:border-zinc-600">
                {children}
              </code>
            ) : (
              <pre className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-md overflow-x-auto text-xs my-2 border border-zinc-200 dark:border-zinc-700">
                <code className="text-zinc-700 dark:text-zinc-300">{children}</code>
              </pre>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-zinc-300 dark:border-zinc-600 pl-3 italic text-zinc-500 dark:text-zinc-400 my-2">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, href }) => (
            <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          hr: () => <hr className="my-3 border-zinc-200 dark:border-zinc-700" />,
          table: ({ children }) => (
            <table className="w-full text-xs border-collapse my-2">
              {children}
            </table>
          ),
          thead: ({ children }) => <thead className="bg-zinc-50 dark:bg-zinc-800">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-left font-semibold text-zinc-900 dark:text-zinc-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-zinc-700 dark:text-zinc-300">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
