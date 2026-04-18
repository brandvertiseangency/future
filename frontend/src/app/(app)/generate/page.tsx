'use client'

import { useState, useCallback, useRef } from 'react'
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
} from 'lucide-react'
import { useGenerationStore, type OutputCard } from '@/stores/generation'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BlurFade } from '@/components/ui/blur-fade'
import { ShimmerButton } from '@/components/ui/shimmer-button'
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
  scheduled: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
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
      className="group rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]
                 overflow-hidden hover:border-[var(--card-hover-border)] transition-all hover:scale-[1.01]"
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
                        ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
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
                           focus:outline-none focus:border-violet-500/40 transition-colors"
                placeholder="Custom feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button
                onClick={() => { toast.loading('Regenerating...'); setShowFeedback(false) }}
                className="w-full py-2 rounded-lg bg-violet-500/15 border border-violet-500/25
                           text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-colors"
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
    <div className="rounded-xl border border-[var(--card-border)] overflow-hidden">
      <div className="aspect-square bg-[var(--bg-subtle)] animate-pulse" />
      <div className="p-3 space-y-2 border-t border-[var(--border-dim)]">
        <div className="h-3 rounded bg-[var(--bg-muted)] w-3/4" />
        <div className="h-2 rounded bg-[var(--bg-subtle)] w-1/2" />
      </div>
    </div>
  )
}

export default function GeneratePage() {
  const { form, outputs, isGenerating, setForm, setOutputs, setGenerating, setJobId } = useGenerationStore()
  const [styleOpen, setStyleOpen] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Real credit balance
  const { data: creditsData } = useSWR(
    '/api/credits/balance',
    (url: string) => apiCall<{ balance: number; plan: string }>(url),
    { revalidateOnFocus: false }
  )
  const credits = creditsData?.balance ?? null

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
    const toastId = toast.loading('Starting generation…')
    try {
      const res = await apiCall<{ jobId: string }>('/api/post/generate', {
        method: 'POST', body: JSON.stringify(form),
      })
      setJobId(res.jobId)
      pollingRef.current = setInterval(async () => {
        try {
          const status = await apiCall<{ status: string; outputs?: OutputCard[] }>(`/api/post/status/${res.jobId}`)
          if (status.outputs?.length) setOutputs(status.outputs)
          if (status.status === 'complete' || status.status === 'error') {
            clearInterval(pollingRef.current!)
            setGenerating(false)
            toast.dismiss(toastId)
            if (status.status === 'error') toast.error('Generation failed — please try again')
            else toast.success(`${status.outputs?.length ?? 1} post${(status.outputs?.length ?? 1) !== 1 ? 's' : ''} ready!`)
          }
        } catch { clearInterval(pollingRef.current!); setGenerating(false); toast.dismiss(toastId) }
      }, 2000)
    } catch {
      toast.dismiss(toastId)
      toast.error('Generation failed — please try again')
      setGenerating(false)
    }
  }

  const briefLength = form.brief.length
  const costEstimate = form.platforms.length * 2 || 2

  return (
    <WidgetErrorBoundary>
    <div className="h-[calc(100vh-64px)] flex">
      {/* LEFT — Form */}
      <div className="w-[40%] border-r border-[var(--border-dim)] overflow-y-auto flex flex-col">
        <div className="p-6 space-y-6 flex-1">
          <div>
            <h2 className="text-[var(--text-1)] font-semibold text-xl">Generate Content</h2>
            <p className="text-[var(--text-3)] text-sm mt-0.5">AI will use your brand DNA automatically</p>
          </div>

          {/* Content type */}
          <div>
            <p className="text-[var(--text-3)] text-xs uppercase tracking-wider font-medium mb-2">Content Type</p>
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-base)]">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ contentType: type })}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize',
                    form.contentType === type
                      ? 'bg-[var(--bg-overlay)] border border-[var(--border-loud)] text-[var(--text-1)] shadow-sm'
                      : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-[var(--text-3)] text-xs uppercase tracking-wider font-medium mb-2">Target Platform</p>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map((p) => {
                const selected = form.platforms.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      'h-12 rounded-xl border text-xs font-medium transition-all',
                      selected
                        ? 'text-[var(--text-1)] bg-[var(--bg-subtle)]'
                        : 'border-[var(--border-base)] bg-[var(--card-bg)] text-[var(--text-3)] hover:border-[var(--border-loud)] hover:text-[var(--text-2)]'
                    )}
                    style={selected ? { borderColor: p.color, boxShadow: `0 0 0 1px ${p.color}40` } : {}}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Brief */}
          <div>
            <p className="text-[var(--text-3)] text-xs uppercase tracking-wider font-medium mb-2">What is this post about?</p>
            <div className="relative">
              <textarea
                value={form.brief}
                onChange={(e) => setForm({ brief: e.target.value.slice(0, 200) })}
                rows={5}
                placeholder="e.g. Launching our new feature — show the team celebrating..."
                className="w-full bg-[var(--card-bg)] border border-[var(--border-base)] rounded-xl px-4 py-3
                           text-[var(--text-1)] text-sm placeholder:text-[var(--text-4)] resize-none
                           focus:outline-none focus:border-violet-500/50 transition-all"
              />
              <span className="absolute bottom-3 right-3 text-[var(--text-4)] text-xs">{briefLength}/200</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ brief: form.brief ? `${form.brief} ${p}` : p })}
                  className="px-3 py-1 rounded-full text-[11px] bg-[var(--bg-subtle)] border border-[var(--border-base)]
                             text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--border-loud)] transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Style override */}
          <div>
            <button
              onClick={() => setStyleOpen(!styleOpen)}
              className="flex items-center gap-2 text-[var(--text-3)] text-sm font-medium hover:text-[var(--text-2)] transition-colors w-full"
            >
              Style Override
              <ChevronDown size={14} className={cn('transition-transform', styleOpen && 'rotate-180')} />
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
                        <p className="text-[var(--text-4)] text-xs mb-2">{label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map((item) => (
                            <button
                              key={item}
                              onClick={() => setForm({ [field]: (form[field] === item.toLowerCase() ? '' : item.toLowerCase()) })}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-xs border transition-all',
                                form[field] === item.toLowerCase()
                                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                                  : 'border-[var(--border-base)] text-[var(--text-3)] hover:border-[var(--border-loud)] hover:text-[var(--text-2)]'
                              )}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <p className="text-[var(--text-4)] text-xs mb-2">Text Overlay</p>
                      <div className="flex gap-1.5">
                        {['Yes', 'No'].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setForm({ textOverlay: opt === 'Yes' })}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs border transition-all',
                              (form.textOverlay ? 'Yes' : 'No') === opt
                                ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                                : 'border-[var(--border-base)] text-[var(--text-3)] hover:border-[var(--border-loud)]'
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
            <p className="text-[var(--text-3)] text-xs uppercase tracking-wider font-medium mb-2">Reference Images (optional)</p>
            <div
              {...getRootProps()}
              className={cn(
                'h-20 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all text-sm',
                isDragActive
                  ? 'border-violet-500/40 bg-violet-500/[0.04] text-violet-400'
                  : 'border-[var(--border-base)] text-[var(--text-4)] hover:border-[var(--border-loud)] hover:text-[var(--text-3)]'
              )}
            >
              <input {...getInputProps()} />
              <ImageIcon size={16} />
              Drag reference image or browse
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="p-6 border-t border-[var(--border-dim)]">
          <ShimmerButton
            onClick={generate}
            disabled={isGenerating}
            className="w-full h-14 rounded-xl text-base font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2 text-violet-300" />
                Generate Content
              </>
            )}
          </ShimmerButton>
          <p className="text-[var(--text-4)] text-xs text-center mt-2">
            This will use ~{costEstimate} credits
            {credits !== null && (
              <span className={cn('ml-1', credits < costEstimate ? 'text-rose-400' : 'text-[var(--text-4)]')}>
                ({credits} remaining
                {credits < costEstimate && ' — not enough!'})
              </span>
            )}
          </p>
          {credits !== null && credits < 50 && (
            <p className="text-[10px] text-orange-400 text-center mt-1 flex items-center justify-center gap-1">
              <AlertCircle size={10} />Running low on credits —{' '}
              <a href="/settings#billing" className="underline hover:text-orange-300">buy more</a>
            </p>
          )}
        </div>
      </div>

      {/* RIGHT — Output */}
      <div className="flex-1 overflow-y-auto p-6">
        {!isGenerating && outputs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center relative">
            <DotPattern className="absolute inset-0 text-[var(--text-4)] opacity-30" width={20} height={20} />
            <div className="relative z-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-base)]
                              flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-violet-400" />
              </div>
              <p className="text-[var(--text-2)] font-medium">Your generated content will appear here</p>
              <p className="text-[var(--text-3)] text-sm">Fill out the form and click Generate</p>
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
