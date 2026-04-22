'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, ExternalLink, Check, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AgentPromptBoxProps {
  prompt: string
  isLoading?: boolean
  externalToolUrl?: string
  externalToolLabel?: string
  onRegenerate?: () => void
}

export function AgentPromptBox({
  prompt,
  isLoading,
  externalToolUrl,
  externalToolLabel = 'Open in Tool',
  onRegenerate,
}: AgentPromptBoxProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    toast.success('Prompt copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-dim)] bg-white/2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
              isLoading ? "bg-amber-400" : "bg-emerald-400"
            )} />
            <span className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              isLoading ? "bg-amber-400" : "bg-emerald-400"
            )} />
          </span>
          <span className="text-[12px] font-medium text-[var(--text-3)]">
            {isLoading ? 'Generating prompt…' : 'Generated Prompt'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]
                         text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-white/5 transition-all"
            >
              <RefreshCw size={13} className={cn(isLoading && 'animate-spin')} />
              Regenerate
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={isLoading || !prompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]
                       bg-white/5 hover:bg-white/10 text-[var(--text-2)]
                       transition-all duration-150 disabled:opacity-40"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
          {externalToolUrl && (
            <a
              href={externalToolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]
                         bg-violet-600/20 hover:bg-violet-600/30 text-violet-300
                         border border-violet-500/20 transition-all duration-150"
            >
              <ExternalLink size={13} />
              {externalToolLabel}
            </a>
          )}
        </div>
      </div>

      {/* Prompt body */}
      <div className="relative p-5 min-h-[220px]">
        {isLoading ? (
          <div className="space-y-3">
            {[100, 90, 95, 70, 85].map((w, i) => (
              <div
                key={i}
                className="h-3.5 rounded-md bg-white/5 animate-pulse"
                style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : (
          <pre className="text-[12.5px] text-[var(--text-2)] leading-relaxed whitespace-pre-wrap font-mono">
            {prompt || 'Your generated prompt will appear here…'}
          </pre>
        )}
      </div>
    </motion.div>
  )
}
