'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Presentation, BarChart2, Users, Lightbulb, FileText, TrendingUp, BookOpen } from 'lucide-react'
import { AgentHero } from '@/components/agents/agent-hero'
import { AgentFeatureCards } from '@/components/agents/agent-feature-cards'
import { AgentLockedOverlay } from '@/components/agents/agent-locked-overlay'
import { AgentPromptBox } from '@/components/agents/agent-prompt-box'
import { useBrandStore } from '@/stores/brand'
import { useAgentsStore } from '@/stores/agents'
import { buildPresentationPrompt } from '@/lib/prompt-engine'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const FEATURES = [
  {
    icon: FileText,
    title: 'Company Profile',
    description: '10–14 slide deck for partners, clients, and enterprise accounts.',
  },
  {
    icon: TrendingUp,
    title: 'Investor Pitch Deck',
    description: 'Seed to Series A ready — problem, solution, traction, the ask.',
  },
  {
    icon: BarChart2,
    title: 'Slide-by-Slide Briefs',
    description: 'Headline, body copy, visual direction, and speaker notes per slide.',
  },
  {
    icon: Lightbulb,
    title: 'Story-Driven Structure',
    description: 'Narrative arc designed to engage and persuade your specific audience.',
  },
  {
    icon: Users,
    title: 'Audience-Aware Copy',
    description: 'Language calibrated for investors, enterprise buyers, or strategic partners.',
  },
  {
    icon: BookOpen,
    title: 'Presenter-Ready',
    description: 'Speaker notes included per slide so you can present with confidence.',
  },
]

type DeckType = {
  id: 'company-profile' | 'pitch-deck'
  label: string
  icon: typeof FileText
  subtitle: string
  slides: string
  audience: string
}

const DECK_TYPES: DeckType[] = [
  {
    id: 'company-profile',
    label: 'Company Profile',
    icon: FileText,
    subtitle: 'For partners, clients & accounts',
    slides: '10–14 slides',
    audience: 'Enterprise / B2B',
  },
  {
    id: 'pitch-deck',
    label: 'Pitch Deck',
    icon: TrendingUp,
    subtitle: 'For investors & accelerators',
    slides: '10–12 slides',
    audience: 'VCs / Angels',
  },
]

const TOOLS = [
  { label: 'Open in Gamma', url: 'https://gamma.app' },
  { label: 'Open in Beautiful.ai', url: 'https://beautiful.ai' },
  { label: 'Open in Tome', url: 'https://tome.app' },
]

export default function PresentationsPage() {
  const { currentBrand } = useBrandStore()
  const { isUnlocked, unlockAgent } = useAgentsStore()
  const unlocked = isUnlocked('presentations')

  const [selectedDeck, setSelectedDeck] = useState<DeckType>(DECK_TYPES[0])
  const [selectedTool, setSelectedTool] = useState(TOOLS[0])
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!currentBrand) {
      toast.error('Set up your brand first.')
      return
    }
    setIsLoading(true)
    setPrompt('')
    await new Promise((r) => setTimeout(r, 1400))

    const generated = buildPresentationPrompt(
      {
        name: currentBrand.name,
        description: currentBrand.voice,
        industry: currentBrand.industry,
        voice: currentBrand.voice,
        goals: currentBrand.goals,
        audience: currentBrand.audience as Record<string, unknown>,
      },
      selectedDeck.id
    )

    setPrompt(generated)
    setIsLoading(false)
    toast.success(`${selectedDeck.label} prompt generated!`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <AgentHero
        icon={Presentation}
        iconColor="amber"
        badge="Agent"
        title="Presentations"
        description="Generate structured, investor-ready pitch decks and company profiles built around your brand story. Slide-by-slide copy, visual direction, and speaker notes — ready for any AI presentation tool."
        isLocked={!unlocked}
      />

      <AgentFeatureCards features={FEATURES} />

      <div className="relative">
        {!unlocked && (
          <AgentLockedOverlay
            agentName="Presentations"
            description="Unlock this agent to generate complete pitch decks and company profiles with slide-by-slide copy, design direction, and speaker notes."
            onUnlock={() => unlockAgent('presentations')}
          />
        )}

        <motion.div
          className={!unlocked ? 'opacity-30 pointer-events-none select-none blur-sm' : ''}
          animate={{ opacity: unlocked ? 1 : 0.3 }}
        >
          {/* Deck type selector */}
          <div className="rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)] p-6 mb-5">
            <h2 className="text-[15px] font-semibold text-[var(--text-1)] mb-1">Presentation Type</h2>
            <p className="text-[12.5px] text-[var(--text-3)] mb-5">Choose the type of presentation to generate.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {DECK_TYPES.map((deck) => {
                const active = selectedDeck.id === deck.id
                return (
                  <motion.button
                    key={deck.id}
                    onClick={() => { setSelectedDeck(deck); setPrompt('') }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-200',
                      active
                        ? 'border-amber-500/40 bg-amber-500/8'
                        : 'border-[var(--border-dim)] bg-white/2 hover:bg-white/5 hover:border-white/10'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      active ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-[var(--text-3)]'
                    )}>
                      <deck.icon size={18} />
                    </div>
                    <div>
                      <p className={cn('text-[14px] font-semibold mb-0.5', active ? 'text-amber-200' : 'text-[var(--text-1)]')}>
                        {deck.label}
                      </p>
                      <p className="text-[12px] text-[var(--text-3)]">{deck.subtitle}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-[var(--text-4)]">{deck.slides}</span>
                        <span className="text-[var(--text-4)]">·</span>
                        <span className="text-[11px] text-[var(--text-4)]">{deck.audience}</span>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Slide structure preview */}
            <div className="rounded-xl border border-[var(--border-dim)] bg-[var(--bg-subtle)] p-4 mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-3">Slide Structure Preview</p>
              <div className="flex flex-wrap gap-2">
                {(selectedDeck.id === 'pitch-deck'
                  ? ['Cover', 'Problem', 'Solution', 'Market', 'Product', 'Business Model', 'Traction', 'GTM', 'Competition', 'Team', 'The Ask', 'Vision']
                  : ['Cover', 'Executive Summary', 'Our Story', 'The Problem', 'Our Solution', 'Why Us', 'Services', 'Process', 'Team', 'Clients', 'Milestones', 'Contact']
                ).map((slide, i) => (
                  <motion.span
                    key={slide}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-2.5 py-1 rounded-lg text-[11.5px] bg-white/5 text-[var(--text-3)] border border-white/5"
                  >
                    {i + 1}. {slide}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Brand info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-1.5">Company</label>
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
            </div>

            {/* Tool selector */}
            <div className="mb-5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-2">Open In</label>
              <div className="flex flex-wrap gap-2">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.label}
                    onClick={() => setSelectedTool(tool)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 border ${
                      selectedTool.label === tool.label
                        ? 'bg-amber-600/20 border-amber-500/40 text-amber-300'
                        : 'bg-white/3 border-white/8 text-[var(--text-3)] hover:bg-white/6'
                    }`}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !currentBrand}
              className="flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-gradient-to-r from-amber-600 to-amber-500 text-white
                         text-[13.5px] font-semibold transition-all duration-200
                         hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-500/20
                         disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Presentation size={15} />
              {isLoading ? 'Generating…' : `Generate ${selectedDeck.label} Prompt`}
            </button>
          </div>

          {(prompt || isLoading) && (
            <AgentPromptBox
              prompt={prompt}
              isLoading={isLoading}
              externalToolUrl={selectedTool.url}
              externalToolLabel={selectedTool.label}
              onRegenerate={handleGenerate}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}
