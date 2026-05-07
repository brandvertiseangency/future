'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Image, CreditCard, Megaphone, Layers, Wand2, Sliders } from 'lucide-react'
import { AgentHero } from '@/components/agents/agent-hero'
import { AgentFeatureCards } from '@/components/agents/agent-feature-cards'
import { AgentLockedOverlay } from '@/components/agents/agent-locked-overlay'
import { AgentPromptBox } from '@/components/agents/agent-prompt-box'
import { useBrandStore } from '@/stores/brand'
import { useAgentUnlocked } from '@/lib/agent-access'
import { apiCall, AI_REQUEST_TIMEOUT_MS } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { PageContainer } from '@/components/ui/page-primitives'

const FEATURES = [
  {
    icon: Image,
    title: 'Poster Generation',
    description: 'Marketing posters for print and digital with full copy, palette, and visual direction.',
  },
  {
    icon: Megaphone,
    title: 'Banner Ads',
    description: 'Multi-size digital banner briefs with headline, CTA, and layout per ad size.',
  },
  {
    icon: CreditCard,
    title: 'Business Cards',
    description: 'Premium visiting card layouts — front, back, color, typography, finish.',
  },
  {
    icon: Layers,
    title: 'Brand Consistency',
    description: 'All assets share the same palette, tone, and visual identity from your brand DNA.',
  },
  {
    icon: Sliders,
    title: 'Design Preferences',
    description: 'Respects your design preferences — minimal, luxury, bold, or playful.',
  },
  {
    icon: Wand2,
    title: 'AI-Ready Briefs',
    description: 'Prompts formatted for Midjourney, DALL-E, Firefly, or any AI design tool.',
  },
]

type FormatOption = {
  id: 'poster' | 'banner' | 'visiting-card'
  label: string
  icon: typeof Image
  description: string
}

const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'poster', label: 'Poster', icon: Image, description: 'A3 / 18×24" print or digital' },
  { id: 'banner', label: 'Banner Ad', icon: Megaphone, description: '728×90, 300×250, 1200×628' },
  { id: 'visiting-card', label: 'Visiting Card', icon: CreditCard, description: '3.5×2" standard' },
]

const TOOLS = [
  { label: 'Open in Midjourney', url: 'https://midjourney.com' },
  { label: 'Open in Adobe Firefly', url: 'https://firefly.adobe.com' },
  { label: 'Open in DALL-E', url: 'https://openai.com/dall-e-3' },
]

function parseAgentError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Generation failed'
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed?.message === 'string' && parsed.message.trim()) return parsed.message
    if (typeof parsed?.error === 'string' && parsed.error.trim()) return parsed.error
  } catch {
    /* ignore */
  }
  return raw
}

export default function BrandingKitPage() {
  const { currentBrand } = useBrandStore()
  const unlocked = useAgentUnlocked('branding-kit')

  const [selectedFormat, setSelectedFormat] = useState<FormatOption>(FORMAT_OPTIONS[0])
  const [selectedTool, setSelectedTool] = useState(TOOLS[0])
  const [occasion, setOccasion] = useState('')
  const [extraText, setExtraText] = useState('')
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!currentBrand) {
      toast.error('Set up your brand first.')
      return
    }
    setIsLoading(true)
    setPrompt('')
    try {
      const res = await apiCall<{ prompt: string }>('/api/agents/generate', {
        method: 'POST',
        body: JSON.stringify({
          agentType: 'branding-kit',
          brandingFormat: selectedFormat.id,
          brandingOccasion: occasion.trim() || undefined,
          brandingText: extraText.trim() || undefined,
        }),
        timeoutMs: AI_REQUEST_TIMEOUT_MS,
      })
      setPrompt(res.prompt || '')
      toast.success(`${selectedFormat.label} prompt generated!`)
    } catch (e) {
      toast.error(parseAgentError(e))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer className="max-w-5xl px-4 md:px-8">
      <AgentHero
        icon={Palette}
        iconColor="cyan"
        badge="Agent"
        title="Branding Kit"
        description="Generate detailed design briefs for posters, banner ads, and business cards — all grounded in your brand identity. AI-ready prompts for any design tool."
        isLocked={!unlocked}
      />

      <AgentFeatureCards features={FEATURES} />

      <div className="relative">
        {!unlocked && (
          <AgentLockedOverlay
            agentName="Branding Kit"
            description="Unlock this agent to generate professional branding asset briefs — posters, banners, and business cards — tailored to your brand identity."
          />
        )}

        <motion.div
          className={!unlocked ? 'opacity-30 pointer-events-none select-none blur-sm' : ''}
          animate={{ opacity: unlocked ? 1 : 0.3 }}
        >
          <div className="rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)] p-6 mb-5">
            <h2 className="text-[15px] font-semibold text-[var(--text-1)] mb-1">Select Asset Format</h2>
            <p className="text-[12.5px] text-[var(--text-3)] mb-5">Choose the type of branding asset to generate.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {FORMAT_OPTIONS.map((fmt) => {
                const active = selectedFormat.id === fmt.id
                return (
                  <motion.button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      setSelectedFormat(fmt)
                      setPrompt('')
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all duration-200',
                      active
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                        : 'border-[var(--border-dim)] bg-foreground/[0.02] text-[var(--text-3)] hover:bg-foreground/[0.05] hover:border-foreground/10'
                    )}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center',
                      active ? 'bg-cyan-500/20' : 'bg-foreground/[0.05]'
                    )}>
                      <fmt.icon size={17} />
                    </div>
                    <div>
                      <p className={cn('text-[13.5px] font-semibold', active ? 'text-cyan-200' : 'text-[var(--text-1)]')}>
                        {fmt.label}
                      </p>
                      <p className="text-[11.5px] text-[var(--text-4)] mt-0.5">{fmt.description}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-1.5">Occasion / campaign (optional)</label>
                <input
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-dim)] bg-[var(--bg-subtle)] px-4 py-3 text-[13.5px] text-[var(--text-2)] outline-none focus:border-cyan-500/50"
                  placeholder="e.g. Diwali sale, product launch"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-1.5">On-artwork copy (optional)</label>
                <input
                  value={extraText}
                  onChange={(e) => setExtraText(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-dim)] bg-[var(--bg-subtle)] px-4 py-3 text-[13.5px] text-[var(--text-2)] outline-none focus:border-cyan-500/50"
                  placeholder="Headline or legal line to include"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-1.5">Brand</label>
                <div className="px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-dim)] text-[13.5px] text-[var(--text-2)]">
                  {currentBrand?.name || '—'}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-1.5">Industry</label>
                <div className="px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-dim)] text-[13.5px] text-[var(--text-2)]">
                  {currentBrand?.industry || '—'}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-1.5">Voice</label>
                <div className="px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-dim)] text-[13.5px] text-[var(--text-2)] truncate">
                  {currentBrand?.voice || '—'}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-2">Open In</label>
              <div className="flex flex-wrap gap-2">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.label}
                    type="button"
                    onClick={() => setSelectedTool(tool)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 border ${
                      selectedTool.label === tool.label
                        ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-300'
                        : 'bg-foreground/[0.03] border-foreground/[0.08] text-[var(--text-3)] hover:bg-foreground/[0.06]'
                    }`}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isLoading || !currentBrand}
              className="flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-gradient-to-r from-cyan-600 to-cyan-500 text-white
                         text-[13.5px] font-semibold transition-all duration-200
                         hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20
                         disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Palette size={15} />
              {isLoading ? 'Generating…' : `Generate ${selectedFormat.label} Prompt`}
            </button>
          </div>

          {(prompt || isLoading) && (
            <AgentPromptBox
              prompt={prompt}
              isLoading={isLoading}
              externalToolUrl={selectedTool.url}
              externalToolLabel={selectedTool.label}
              onRegenerate={() => void handleGenerate()}
            />
          )}
        </motion.div>
      </div>
    </PageContainer>
  )
}
