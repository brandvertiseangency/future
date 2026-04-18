'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ImageIcon, Upload, Filter, Download, Trash2, Sparkles } from 'lucide-react'
import { BlurFade } from '@/components/ui/blur-fade'
import { DotPattern } from '@/components/ui/dot-pattern'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { cn } from '@/lib/utils'

const FILTERS = ['All', 'Instagram', 'LinkedIn', 'Twitter', 'Carousel', 'Story']

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#f43f5e',
  LinkedIn: '#3b82f6',
  Twitter: '#94a3b8',
  Facebook: '#2563eb',
  TikTok: '#10b981',
}

// Demo assets — in production these come from the API
const DEMO_ASSETS = Array.from({ length: 0 }) // empty for now — shows empty state

export default function AssetsPage() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const hasAssets = DEMO_ASSETS.length > 0

  return (
    <div className="p-8 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[var(--text-1)] font-semibold text-2xl">Asset Library</h2>
          <p className="text-[var(--text-3)] text-sm mt-1">All your generated and uploaded content</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-4)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-base)]
                         text-[var(--text-1)] text-sm placeholder:text-[var(--text-4)]
                         focus:outline-none focus:border-violet-500/40 transition-colors w-[240px]"
              placeholder="Search assets..."
            />
          </div>

          {/* Upload */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl
                             border border-[var(--border-base)] bg-[var(--card-bg)]
                             text-[var(--text-2)] text-sm font-medium
                             hover:bg-[var(--bg-subtle)] hover:border-[var(--border-loud)]
                             transition-all">
            <Upload size={15} />
            Upload
          </button>

          <ShimmerButton className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
            <Sparkles size={14} className="text-violet-300" />
            Generate New
          </ShimmerButton>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter size={14} className="text-[var(--text-4)]" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              activeFilter === f
                ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                : 'border-[var(--border-base)] text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--border-loud)]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {!hasAssets && (
        <div className="relative rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] overflow-hidden"
             style={{ minHeight: 400 }}>
          <DotPattern className="absolute inset-0 text-[var(--text-4)] opacity-40" width={24} height={24} />

          <div className="relative flex flex-col items-center justify-center h-[400px] gap-5">
            {/* Animated icon cluster */}
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-base)]
                            flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-blue-500/5" />
              <ImageIcon size={32} className="text-[var(--text-4)] relative z-10" />
            </div>

            <div className="text-center">
              <p className="text-[15px] font-semibold text-[var(--text-1)]">No assets yet</p>
              <p className="text-[13px] text-[var(--text-3)] mt-1 max-w-xs">
                Generated content and uploaded files will appear here
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ShimmerButton className="px-5 py-2.5 rounded-xl text-sm font-medium">
                <Sparkles size={14} className="mr-2 text-violet-300" />
                Generate First Post
              </ShimmerButton>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                                 border border-[var(--border-base)] text-[var(--text-2)] text-sm font-medium
                                 hover:bg-[var(--bg-subtle)] hover:border-[var(--border-loud)] transition-all">
                <Upload size={14} />
                Upload Assets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid (shown when assets exist) */}
      {hasAssets && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {DEMO_ASSETS.map((_, i) => (
            <BlurFade key={i} delay={i * 0.04}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="group relative aspect-square rounded-xl bg-[var(--card-bg)]
                           border border-[var(--card-border)] overflow-hidden cursor-pointer
                           hover:border-[var(--card-hover-border)] transition-all"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon size={32} className="text-[var(--text-4)]" />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100
                                transition-opacity duration-200 flex items-center gap-1.5">
                  <button className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm
                                     flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Download size={12} className="text-white" />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm
                                     flex items-center justify-center hover:bg-rose-500/40 transition-colors">
                    <Trash2 size={12} className="text-white" />
                  </button>
                </div>
              </motion.div>
            </BlurFade>
          ))}
        </div>
      )}
    </div>
  )
}
