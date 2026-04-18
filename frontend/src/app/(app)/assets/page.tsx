'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, ImageIcon, Upload, Filter, Download, Trash2, Sparkles, Loader2 } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import { BlurFade } from '@/components/ui/blur-fade'
import { DotPattern } from '@/components/ui/dot-pattern'
import { AIButton } from '@/components/ui/ai-button'
import { apiCall } from '@/lib/api'
import { cn } from '@/lib/utils'

const FILTERS = ['All', 'Instagram', 'LinkedIn', 'Twitter', 'Carousel', 'Story', 'Logo', 'Reference']

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#f43f5e', linkedin: '#3b82f6', twitter: '#94a3b8',
  facebook: '#2563eb', tiktok: '#10b981',
}

interface Asset {
  id: string
  url: string
  type: string
  platform?: string
  label?: string
  created_at: string
}

const fetcher = <T,>(url: string): Promise<T> => apiCall(url) as Promise<T>

export default function AssetsPage() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const swrKey = `/api/assets?filter=${activeFilter !== 'All' ? activeFilter.toLowerCase() : ''}&q=${query}`
  const { data, isLoading } = useSWR(swrKey, fetcher<{ assets: Asset[] }>, { dedupingInterval: 20000 })

  const assets = data?.assets ?? []

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const form = new FormData()
      Array.from(files).forEach((f) => form.append('files', f))
      await fetch('/api/assets/upload', {
        method: 'POST',
        body: form,
        credentials: 'include',
      })
      mutate(swrKey)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    await apiCall(`/api/assets/${id}`, { method: 'DELETE' })
    mutate(swrKey)
  }

  return (
    <div className="p-8 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[var(--text-1)] font-semibold text-2xl">Asset Library</h2>
          <p className="text-[var(--text-3)] text-sm mt-1">All your generated and uploaded content</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-4)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-base)]
                         text-[var(--text-1)] text-sm placeholder:text-[var(--text-4)]
                         focus:outline-none focus:border-[var(--ai-border)] transition-colors w-[240px]"
              placeholder="Search assets..."
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       border border-[var(--border-base)] bg-[var(--card-bg)]
                       text-[var(--text-2)] text-sm font-medium
                       hover:bg-[var(--bg-subtle)] hover:border-[var(--border-loud)]
                       transition-all disabled:opacity-60">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={15} />}
            Upload
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
            onChange={(e) => handleUpload(e.target.files)} />

          <Link href="/generate">
            <AIButton className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
              <Sparkles size={14} className="text-[var(--ai-color)]" />
              Generate New
            </AIButton>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter size={14} className="text-[var(--text-4)]" />
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              activeFilter === f
                ? 'bg-[var(--ai-glow)] border-[var(--ai-border)] text-[var(--ai-color)]'
                : 'border-[var(--border-base)] text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--border-loud)]')}>
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={28} className="animate-spin text-[var(--ai-color)]" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && assets.length === 0 && (
        <div className="relative rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] overflow-hidden"
             style={{ minHeight: 400 }}>
          <DotPattern className="absolute inset-0 text-[var(--text-4)] opacity-40" width={24} height={24} />
          <div className="relative flex flex-col items-center justify-center h-[400px] gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-base)]
                            flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/5" />
              <ImageIcon size={32} className="text-[var(--text-4)] relative z-10" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-[var(--text-1)]">No assets yet</p>
              <p className="text-[13px] text-[var(--text-3)] mt-1 max-w-xs">
                Generated content and uploaded files will appear here
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/generate">
                <AIButton className="px-5 py-2.5 rounded-xl text-sm font-medium">
                  <Sparkles size={14} className="mr-2 text-[var(--ai-color)]" />
                  Generate First Post
                </AIButton>
              </Link>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                           border border-[var(--border-base)] text-[var(--text-2)] text-sm font-medium
                           hover:bg-[var(--bg-subtle)] hover:border-[var(--border-loud)] transition-all">
                <Upload size={14} />
                Upload Assets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {!isLoading && assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {assets.map((asset, i) => (
            <BlurFade key={asset.id} delay={i * 0.04}>
              <motion.div whileHover={{ scale: 1.02 }}
                className="group relative aspect-square rounded-xl bg-[var(--card-bg)]
                           border border-[var(--card-border)] overflow-hidden cursor-pointer
                           hover:border-[var(--card-hover-border)] transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.label ?? asset.type}
                  className="w-full h-full object-cover" />
                {asset.platform && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                    style={{ backgroundColor: PLATFORM_COLORS[asset.platform.toLowerCase()] ?? '#6366f1' }}>
                    {asset.platform}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100
                                transition-opacity duration-200 flex items-center gap-1.5">
                  <a href={asset.url} download target="_blank" rel="noreferrer"
                    className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm
                               flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Download size={12} className="text-white" />
                  </a>
                  <button onClick={() => handleDelete(asset.id)}
                    className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm
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
