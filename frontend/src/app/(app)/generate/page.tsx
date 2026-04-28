'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import useSWR from 'swr'
import {
  Sparkles,
  Loader2,
  Download,
  RefreshCw,
  CalendarDays,
  Save,
  ImageIcon,
  ChevronDown,
  AlertCircle,
  Package,
  CheckCircle2,
  Ratio,
} from 'lucide-react'
import { useGenerationStore, type OutputCard } from '@/stores/generation'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BlurFade } from '@/components/ui/blur-fade'
import { AIButton } from '@/components/ui/ai-button'
import { DotPattern } from '@/components/ui/dot-pattern'
import { WidgetErrorBoundary } from '@/components/ErrorBoundary'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#f43f5e' },
  { id: 'linkedin', label: 'LinkedIn', color: '#3b82f6' },
  { id: 'twitter', label: 'Twitter/X', color: '#94a3b8' },
  { id: 'facebook', label: 'Facebook', color: '#2563eb' },
  { id: 'tiktok', label: 'TikTok', color: '#10b981' },
  { id: 'youtube', label: 'YouTube', color: '#ef4444' },
  { id: 'pinterest', label: 'Pinterest', color: '#e11d48' },
  { id: 'threads', label: 'Threads', color: '#a1a1aa' },
]

const CONTENT_TYPES = ['post', 'carousel', 'reel', 'story'] as const
const MOODS = ['Energetic', 'Calm', 'Professional', 'Playful']
const FONT_STYLES = ['Minimal', 'Bold', 'Handwritten']
const QUICK_PROMPTS = ['Product Launch', 'Behind the Scenes', 'Tip / Hack']

const RATIOS = [
  { id: '1:1', label: '1:1', description: 'Square' },
  { id: '4:5', label: '4:5', description: 'Portrait' },
  { id: '9:16', label: '9:16', description: 'Vertical' },
  { id: '16:9', label: '16:9', description: 'Landscape' },
]

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#f43f5e',
  linkedin: '#3b82f6',
  twitter: '#94a3b8',
  facebook: '#2563eb',
  tiktok: '#10b981',
  youtube: '#ef4444',
  pinterest: '#e11d48',
  threads: '#a1a1aa',
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
  saved: 'bg-[var(--bg-subtle)] text-[var(--text-3)] border-[var(--border-base)]',
  scheduled: 'bg-[var(--ai-glow)] text-[var(--ai-color)] border-[var(--ai-border)]',
}

function OutputCardComponent({ card, delay }: { card: OutputCard; delay: number }) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [newStatus, setNewStatus] = useState(card.status)
  const quickFeedback = ['More premium', 'Darker', 'Add text', 'Different angle']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-2xl border border-white/[0.08] bg-[#0a0a0a]
                 overflow-hidden hover:border-white/[0.18] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="aspect-square relative bg-[var(--bg-subtle)] flex items-center justify-center">
        {card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={40} className="text-[var(--text-4)]" />
        )}
        <span className={cn('absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wide', STATUS_STYLES[newStatus])}>
          {newStatus}
        </span>
      </div>

      <div className="p-3 border-t border-[var(--border-dim)]">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[11px] capitalize font-medium"
            style={{ color: PLATFORM_COLORS[card.platform] ?? 'var(--text-3)' }}
          >
            {card.platform}
          </span>
          <span className="w-1 h-1 rounded-full bg-[var(--border-loud)]" />
          <p className="text-[var(--text-3)] text-xs truncate flex-1">{card.caption}</p>
        </div>

        <div className="flex items-center gap-1">
          {[
            { icon: Save, title: 'Save', action: () => { setNewStatus('saved'); toast.success('Saved to assets') } },
            { icon: RefreshCw, title: 'Regenerate', action: () => setShowFeedback(!showFeedback) },
            { icon: CalendarDays, title: 'Schedule', action: () => { setNewStatus('scheduled'); toast.success('Moved to schedule') } },
            { icon: Download, title: 'Download', action: () => {} },
          ].map(({ icon: Icon, title, action }) => (
            <button
              key={title}
              title={title}
              onClick={action}
              className="flex-1 py-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)]
                         transition-colors flex items-center justify-center"
            >
              <Icon size={14} className="text-[var(--text-3)]" />
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              <p className="text-[var(--text-3)] text-xs">What should we change?</p>
              <div className="flex flex-wrap gap-1.5">
                {quickFeedback.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFeedback(f)}
                    className={cn(
                      'px-2 py-1 rounded-full text-[10px] border transition-all',
                      feedback === f
                        ? 'bg-[var(--ai-glow)] border-[var(--ai-border)] text-[var(--ai-color)]'
                        : 'border-[var(--border-base)] text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--border-loud)]'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <input
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-base)] rounded-lg px-3 py-2
                           text-[var(--text-1)] text-xs placeholder:text-[var(--text-4)]
                           focus:outline-none focus:border-[var(--ai-border)] transition-colors"
                placeholder="Custom feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button
                onClick={() => { toast.loading('Regenerating...'); setShowFeedback(false) }}
                className="w-full py-2 rounded-lg bg-[var(--ai-glow)] border border-[var(--ai-border)]
                           text-[var(--ai-color)] text-xs font-medium hover:bg-[var(--ai-glow)] transition-colors"
              >
                Apply & Regenerate
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.07] overflow-hidden bg-[#0a0a0a]">
      <div className="aspect-square bg-white/[0.04] animate-pulse" />
      <div className="p-3 space-y-2 border-t border-white/[0.05]">
        <div className="h-2.5 rounded-lg bg-white/[0.05] w-3/4 animate-pulse" />
        <div className="h-2 rounded-lg bg-white/[0.03] w-1/2 animate-pulse" />
      </div>
    </div>
  )
}

// ─── Product Selector ─────────────────────────────────────────────────────────
function ProductSelector({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const { data } = useSWR('/api/brand-products', (u: string) => apiCall<{ products: { id: string; name: string; images: string[]; description?: string; price?: string; visual_description?: string }[] }>(u), { revalidateOnFocus: false })
  const products = data?.products ?? []
  if (products.length === 0) return null

  return (
    <div>
      <p className="text-white/25 text-[10px] uppercase tracking-[0.14em] font-semibold mb-2 flex items-center gap-1.5">
        <Package size={11} />
        Product / Service
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {products.map((p) => {
          const selected = selectedId === p.id
          return (
            <button
              key={p.id}
              onClick={() => onSelect(selected ? null : p.id)}
              className={cn(
                'rounded-xl border p-1.5 text-left transition-all',
                selected
                  ? 'border-white/[0.25] bg-white/[0.06]'
                  : 'border-white/[0.07] hover:border-white/[0.16] bg-transparent'
              )}
            >
              <div className="w-full aspect-[4/3] rounded-lg bg-white/[0.04] mb-1 overflow-hidden flex items-center justify-center relative">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={12} className="text-white/20" />
                )}
                {selected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <CheckCircle2 size={9} className="text-black" />
                  </div>
                )}
              </div>
              <p className="text-white/70 text-[10px] font-medium truncate">{p.name}</p>
            </button>
          )
        })}
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'rounded-xl border-2 border-dashed p-1.5 flex flex-col items-center justify-center transition-all',
            selectedId === null
              ? 'border-white/[0.25] bg-white/[0.04]'
              : 'border-white/[0.06] hover:border-white/[0.14]'
          )}
        >
          <p className="text-white/25 text-[9px]">None</p>
        </button>
      </div>
    </div>
  )
}


export default function GeneratePage() {
  const { form, outputs, isGenerating, setForm, setOutputs, setGenerating, setJobId } = useGenerationStore()
  const [styleOpen, setStyleOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [ratio, setRatio] = useState<string>('1:1')

  // Real credit balance
  const { data: creditsData } = useSWR(
    '/api/credits/balance',
    (url: string) => apiCall<{ balance: number; plan: string }>(url),
    { revalidateOnFocus: false }
  )
  const credits = creditsData?.balance ?? null

  // Fetch products for brief enrichment
  const { data: productsData } = useSWR('/api/brand-products', (u: string) => apiCall<{ products: { id: string; name: string; description?: string; price?: string; visual_description?: string; images: string[] }[] }>(u), { revalidateOnFocus: false })
  const products = productsData?.products ?? []

  const togglePlatform = (id: string) => {
    const updated = form.platforms.includes(id)
      ? form.platforms.filter((p) => p !== id)
      : [...form.platforms, id]
    setForm({ platforms: updated })
  }

  const onDrop = useCallback((files: File[]) => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setForm({ referenceImageUrls: [...form.referenceImageUrls, ...urls] })
  }, [form.referenceImageUrls, setForm])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: true, accept: { 'image/*': [] },
  })

  const generate = async () => {
    if (!form.brief.trim()) { toast.error('Please describe what this post is about'); return }
    if (form.platforms.length === 0) { toast.error('Select at least one platform'); return }
    if (credits !== null && credits < costEstimate) {
      toast.error(`Not enough credits. You need ~${costEstimate} but have ${credits}.`); return
    }
    setGenerating(true)
    setOutputs([])
    const toastId = toast.loading(`Generating ${form.platforms.length} post${form.platforms.length > 1 ? 's' : ''}…`)

    const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null
    const productBrief = selectedProduct
      ? `${form.brief}\n\nProduct: ${selectedProduct.name}${selectedProduct.description ? ` — ${selectedProduct.description}` : ''}${selectedProduct.price ? ` (${selectedProduct.price})` : ''}${selectedProduct.visual_description ? `\nVisual: ${selectedProduct.visual_description}` : ''}`
      : form.brief

    const results: OutputCard[] = []
    let successCount = 0

    for (const platform of form.platforms) {
      try {
        type GenerateContentResponse = {
          post: { id: string; platform: string; content_type: string; caption: string; hashtags: string[]; image_url?: string }
          imageUrl?: string
          creditsRemaining: number
        }
        const res = await apiCall<GenerateContentResponse>('/api/generate-content', {
          method: 'POST',
          body: JSON.stringify({
            platform,
            contentType: form.contentType,
            brief: productBrief,
            mood: form.mood || undefined,
            theme: form.fontStyle || undefined,
            selectedProductId: selectedProductId || undefined,
            ratio,
          }),
        })
        results.push({
          id: res.post.id || `${platform}-${Date.now()}`,
          imageUrl: res.imageUrl || res.post.image_url,
          platform: res.post.platform,
          contentType: res.post.content_type,
          caption: res.post.caption,
          hashtags: Array.isArray(res.post.hashtags) ? res.post.hashtags : [],
          status: 'new',
        })
        successCount++
        setOutputs([...results])
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        let parsed: { message?: string; reason?: string; provider?: string; error?: string } | null = null
        try {
          parsed = JSON.parse(msg)
        } catch {
          parsed = null
        }
        if (msg.includes('insufficient_credits')) {
          toast.dismiss(toastId)
          toast.error('Not enough credits to continue generation.')
          break
        }
        if (parsed?.error === 'image_generation_failed') {
          const reason = parsed.reason ? ` (${parsed.reason})` : ''
          toast.error(`Failed for ${platform}: image generation issue${reason}`)
        } else if (parsed?.message) {
          toast.error(`Failed for ${platform}: ${parsed.message}`)
        } else {
          toast.error(`Failed for ${platform} — skipping`)
        }
      }
    }

    toast.dismiss(toastId)
    setGenerating(false)
    setJobId(null)

    if (successCount > 0) {
      toast.success(`${successCount} post${successCount !== 1 ? 's' : ''} ready!`)
    } else {
      toast.error('Generation failed — please try again')
    }
  }

  const briefLength = form.brief.length
  const costEstimate = form.platforms.length * 2 || 2

  return (
    <WidgetErrorBoundary>
    <div className="h-[calc(100vh-56px)] flex">
      {/* LEFT — Form */}
      <div className="w-[400px] min-w-[360px] border-r border-white/[0.07] overflow-y-auto flex flex-col scrollbar-hide bg-[#060606]">
        <div className="p-6 space-y-6 flex-1">
          <div>
            <h2 className="text-white font-semibold text-[18px] tracking-[-0.02em]">Generate Content</h2>
            <p className="text-white/35 text-[12.5px] mt-0.5">AI will use your brand DNA automatically</p>
          </div>

          {/* Content type */}
          <div>
            <p className="text-white/25 text-[10px] uppercase tracking-[0.14em] font-semibold mb-2">Content Type</p>
            <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ contentType: type })}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-[11.5px] font-medium transition-all capitalize',
                    form.contentType === type
                      ? 'bg-white/[0.10] border border-white/[0.18] text-white shadow-sm'
                      : 'text-white/30 hover:text-white/55'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-white/25 text-[10px] uppercase tracking-[0.14em] font-semibold mb-2">Target Platform</p>
            <div className="grid grid-cols-4 gap-1.5">
              {PLATFORMS.map((p) => {
                const selected = form.platforms.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      'h-10 rounded-xl border text-[11px] font-medium transition-all',
                      selected
                        ? 'text-white bg-white/[0.07]'
                        : 'border-white/[0.08] bg-transparent text-white/30 hover:border-white/[0.18] hover:text-white/60'
                    )}
                    style={selected ? { borderColor: `${p.color}60`, boxShadow: `0 0 0 1px ${p.color}30` } : {}}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ratio */}
          <div>
            <p className="text-white/25 text-[10px] uppercase tracking-[0.14em] font-semibold mb-2 flex items-center gap-1.5">
              <Ratio size={11} /> Post Ratio
            </p>
            <div className="flex gap-1.5">
              {RATIOS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRatio(r.id)}
                  className={cn(
                    'flex-1 flex flex-col items-center py-2 rounded-xl border text-center transition-all',
                    ratio === r.id
                      ? 'border-white/[0.25] bg-white/[0.07] text-white'
                      : 'border-white/[0.07] text-white/30 hover:border-white/[0.16] hover:text-white/55'
                  )}
                >
                  <span className="text-[11.5px] font-semibold">{r.label}</span>
                  <span className="text-[9px] opacity-60">{r.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brief */}
          <div>
            <p className="text-white/25 text-[10px] uppercase tracking-[0.14em] font-semibold mb-2">What is this post about?</p>
            <div className="relative">
              <textarea
                value={form.brief}
                onChange={(e) => setForm({ brief: e.target.value.slice(0, 200) })}
                rows={5}
                placeholder="e.g. Launching our new feature — show the team celebrating..."
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3
                           text-white/75 text-[13px] placeholder:text-white/18 resize-none
                           focus:outline-none focus:border-white/[0.20] transition-all"
              />
              <span className="absolute bottom-3 right-3 text-white/18 text-[10px]">{briefLength}/200</span>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ brief: form.brief ? `${form.brief} ${p}` : p })}
                  className="px-2.5 py-1 rounded-full text-[10.5px] bg-white/[0.03] border border-white/[0.08]
                             text-white/30 hover:text-white/55 hover:border-white/[0.16] transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Product selector — from API */}
          <ProductSelector selectedId={selectedProductId} onSelect={setSelectedProductId} />

          {/* Style override */}
          <div>
            <button
              onClick={() => setStyleOpen(!styleOpen)}
              className="flex items-center gap-2 text-white/35 text-sm font-medium hover:text-white/60 transition-colors w-full"
            >
              Style Override
              <ChevronDown size={14} className={cn('transition-transform ml-auto', styleOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {styleOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    {[
                      { label: 'Mood', items: MOODS, field: 'mood' as const },
                      { label: 'Font Style', items: FONT_STYLES, field: 'fontStyle' as const },
                    ].map(({ label, items, field }) => (
                      <div key={label}>
                        <p className="text-white/25 text-[10px] uppercase tracking-[0.14em] mb-2">{label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map((item) => (
                            <button
                              key={item}
                              onClick={() => setForm({ [field]: (form[field] === item.toLowerCase() ? '' : item.toLowerCase()) })}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-xs border transition-all',
                                form[field] === item.toLowerCase()
                                  ? 'bg-white/[0.10] border-white/[0.25] text-white'
                                  : 'border-white/[0.08] text-white/30 hover:border-white/[0.18] hover:text-white/55'
                              )}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <p className="text-white/25 text-[10px] uppercase tracking-[0.14em] mb-2">Text Overlay</p>
                      <div className="flex gap-1.5">
                        {['Yes', 'No'].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setForm({ textOverlay: opt === 'Yes' })}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs border transition-all',
                              (form.textOverlay ? 'Yes' : 'No') === opt
                                ? 'bg-white/[0.10] border-white/[0.25] text-white'
                                : 'border-white/[0.08] text-white/30 hover:border-white/[0.18]'
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reference images */}
          <div>
            <p className="text-white/25 text-[10px] uppercase tracking-[0.14em] font-semibold mb-2">Reference Images (optional)</p>
            <div
              {...getRootProps()}
              className={cn(
                'h-20 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all text-sm',
                isDragActive
                  ? 'border-white/[0.30] bg-white/[0.04] text-white/70'
                  : 'border-white/[0.08] text-white/20 hover:border-white/[0.18] hover:text-white/40'
              )}
            >
              <input {...getInputProps()} />
              <ImageIcon size={16} />
              Drag reference image or browse
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="p-5 border-t border-white/[0.07]">
          <AIButton
            onClick={generate}
            disabled={isGenerating}
            className="w-full h-12 rounded-xl text-[14px] font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={15} className="mr-2" />
                Generate Content
              </>
            )}
          </AIButton>
          <p className="text-white/18 text-[10.5px] text-center mt-2">
            ~{costEstimate} credits
            {credits !== null && (
              <span className={cn('ml-1', credits < costEstimate ? 'text-rose-400' : 'text-white/18')}>
                ({credits} remaining{credits < costEstimate && ' — not enough!'})
              </span>
            )}
          </p>
          {credits !== null && credits < 50 && (
            <p className="text-[10px] text-orange-400/80 text-center mt-1 flex items-center justify-center gap-1">
              <AlertCircle size={10} />Running low —{' '}
              <a href="/settings#billing" className="underline hover:text-orange-300">buy more</a>
            </p>
          )}
        </div>
      </div>

      {/* RIGHT — Output */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#040404] scrollbar-hide">
        {!isGenerating && outputs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center relative">
            <DotPattern className="absolute inset-0 text-white/[0.04] opacity-50" width={20} height={20} />
            <div className="relative z-10 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08]
                              flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-white/30" />
              </div>
              <p className="text-white/40 font-medium text-[14px]">Your generated content will appear here</p>
              <p className="text-white/20 text-[12px]">Fill out the form and click Generate</p>
            </div>
          </div>
        )}

        {isGenerating && outputs.length === 0 && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {outputs.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {outputs.map((card, i) => (
              <BlurFade key={card.id} delay={i * 0.05}>
                <OutputCardComponent card={card} delay={i * 0.05} />
              </BlurFade>
            ))}
            {isGenerating && <SkeletonCard />}
          </div>
        )}
      </div>
    </div>
    </WidgetErrorBoundary>
  )
}
