import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'

interface PreviewPanelProps {
  markdown: string
  completion: string
  isLoading: boolean
  error: Error | undefined
  onGenerate: () => void
  onRetry: () => void
  canGenerate: boolean
  hasKey: boolean
}

type Tab = 'markdown' | 'preview' | 'response'

const TAB_LABELS: Record<Tab, string> = {
  markdown: 'Raw',
  preview: 'Preview',
  response: 'AI Response',
}

export function PreviewPanel({
  markdown,
  completion,
  isLoading,
  error,
  onGenerate,
  onRetry,
  canGenerate,
  hasKey,
}: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('markdown')
  const [hasCopied, setHasCopied] = useState(false)

  const hasResponse = !!completion || isLoading || !!error

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handleGenerate = () => {
    setActiveTab('response')
    onGenerate()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-gray-200 bg-white">
        {(['markdown', 'preview', 'response'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'relative px-4 py-3 text-xs font-medium transition-colors',
              activeTab === tab
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab === 'response' && (
              <span className="mr-1.5">
                {isLoading ? (
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                ) : hasResponse ? (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                ) : null}
              </span>
            )}
            {TAB_LABELS[tab]}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeTab === 'markdown' && (
          markdown.trim() ? (
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-700">
              {markdown}
            </pre>
          ) : (
            <p className="text-xs italic text-gray-400">
              Fill in the form to build your spec…
            </p>
          )
        )}

        {activeTab === 'preview' && (
          markdown.trim() ? (
            <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-strong:font-semibold prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:text-[0.8em]">
              <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
            </div>
          ) : (
            <p className="text-xs italic text-gray-400">
              Fill in the form to see a rendered preview…
            </p>
          )
        )}

        {activeTab === 'response' && (
          error ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-medium">Generation failed</p>
                <p className="mt-0.5 text-xs">{error.message}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            </div>
          ) : completion ? (
            <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:text-[0.8em]">
              <Markdown remarkPlugins={[remarkGfm]}>{completion}</Markdown>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-blue-400" />
              Generating…
            </div>
          ) : (
            <p className="text-xs italic text-gray-400">
              Click Generate to get an AI response based on your spec.
            </p>
          )
        )}
      </div>

      {/* Action bar */}
      <div className="shrink-0 border-t border-gray-200 bg-white p-3">
        {!hasKey && (
          <p className="mb-2 text-center text-[11px] text-gray-400">
            Add your API key (top right) to generate.
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCopy}
            disabled={!markdown.trim()}
          >
            {hasCopied
              ? '✓ Copied'
              : activeTab === 'preview'
                ? 'Copy Markdown'
                : 'Copy'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={handleGenerate}
            disabled={!canGenerate || !hasKey || isLoading}
          >
            {isLoading ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      </div>
    </div>
  )
}
