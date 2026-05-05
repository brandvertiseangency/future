'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Layout, Type, Layers, MousePointerClick, Smartphone, Zap } from 'lucide-react'
import { AgentHero } from '@/components/agents/agent-hero'
import { AgentFeatureCards } from '@/components/agents/agent-feature-cards'
import { AgentLockedOverlay } from '@/components/agents/agent-locked-overlay'
import { AgentPromptBox } from '@/components/agents/agent-prompt-box'
import { useBrandStore } from '@/stores/brand'
import { useAgentUnlocked } from '@/lib/agent-access'
import { apiCall, AI_REQUEST_TIMEOUT_MS } from '@/lib/api'
import { toast } from 'sonner'
import { PageContainer } from '@/components/ui/page-primitives'

const FEATURES = [
  {
    icon: Layout,
    title: 'Full Page Architecture',
    description: 'Generates complete section-by-section landing page structure tailored to your brand.',
  },
  {
    icon: Type,
    title: 'Conversion-Optimised Copy',
    description: 'Headlines, subheadlines, and CTAs written in your brand voice and tone.',
  },
  {
    icon: Layers,
    title: 'Section-Level Design Briefs',
    description: 'Design direction per section — colors, spacing, hierarchy, component types.',
  },
  {
    icon: MousePointerClick,
    title: 'CTA Strategy',
    description: 'Strategically placed calls-to-action mapped to your conversion goals.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Thinking',
    description: 'Layout suggestions that prioritise mobile UX without compromising desktop.',
  },
  {
    icon: Zap,
    title: 'Ready for Any Builder',
    description: 'Output works with Webflow, Framer, Wix, or any AI site builder prompt.',
  },
]

const TOOLS = [
  { label: 'Open in Framer AI', url: 'https://framer.com' },
  { label: 'Open in Webflow AI', url: 'https://webflow.com' },
  { label: 'Open in v0', url: 'https://v0.dev' },
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

export default function WebsiteBuilderPage() {
  const { currentBrand } = useBrandStore()
  const unlocked = useAgentUnlocked('website-builder')

  const [websiteGoal, setWebsiteGoal] = useState('')
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTool, setSelectedTool] = useState(TOOLS[0])

  const handleGenerate = async () => {
    if (!currentBrand) {
      toast.error('Set up your brand first to generate a website prompt.')
      return
    }
    setIsLoading(true)
    setPrompt('')
    try {
      const res = await apiCall<{ prompt: string }>('/api/agents/generate', {
        method: 'POST',
        body: JSON.stringify({
          agentType: 'website-builder',
          websiteGoal: websiteGoal.trim() || undefined,
          websiteSections: ['Hero', 'Social proof', 'Features', 'FAQ', 'CTA'],
        }),
        timeoutMs: AI_REQUEST_TIMEOUT_MS,
      })
      setPrompt(res.prompt || '')
      toast.success('Website prompt generated!')
    } catch (e) {
      toast.error(parseAgentError(e))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer className="max-w-5xl px-4 md:px-8">
      <AgentHero
        icon={Globe}
        iconColor="violet"
        badge="Agent"
        title="Website Builder"
        description="Generate a complete, conversion-optimised landing page structure using your brand data. Get section-level copy, design direction, and CTA strategy — ready to paste into any AI website builder."
        isLocked={!unlocked}
      />

      <AgentFeatureCards features={FEATURES} />

      <div className="relative">
        {!unlocked && (
          <AgentLockedOverlay
            agentName="Website Builder"
            description="Unlock this agent to generate full landing page structures with copy, design direction, and CTA strategy tailored to your brand."
          />
        )}

        <motion.div
          className={!unlocked ? 'opacity-30 pointer-events-none select-none blur-sm' : ''}
          animate={{ opacity: unlocked ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)] p-6 mb-5">
            <h2 className="text-[15px] font-semibold text-[var(--text-1)] mb-1">Brand Context</h2>
            <p className="text-[12.5px] text-[var(--text-3)] mb-5">
              Pulled from your active brand on the server. Optionally refine the primary goal below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-1.5">
                  Brand Name
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-dim)] text-[13.5px] text-[var(--text-2)]">
                  {currentBrand?.name || 'Set up your brand first'}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-1.5">
                  Industry
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-dim)] text-[13.5px] text-[var(--text-2)]">
                  {currentBrand?.industry || '—'}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-1.5">
                Primary goal (optional)
              </label>
              <input
                value={websiteGoal}
                onChange={(e) => setWebsiteGoal(e.target.value)}
                placeholder="e.g. Book demo calls from founder-led SaaS traffic"
                className="w-full rounded-xl border border-[var(--border-dim)] bg-[var(--bg-subtle)] px-4 py-3 text-[13.5px] text-[var(--text-2)] outline-none focus:border-violet-500/50"
              />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-1.5">
                Goals
              </label>
              <div className="flex flex-wrap gap-2">
                {(currentBrand?.goals || ['awareness', 'growth']).map((g) => (
                  <span key={g} className="px-3 py-1 rounded-full text-[12px] bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-4)] mb-2">
                Open In
              </label>
              <div className="flex flex-wrap gap-2">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.label}
                    type="button"
                    onClick={() => setSelectedTool(tool)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 border ${
                      selectedTool.label === tool.label
                        ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                        : 'bg-white/3 border-white/8 text-[var(--text-3)] hover:bg-white/6'
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
                         bg-gradient-to-r from-violet-600 to-violet-500 text-white
                         text-[13.5px] font-semibold transition-all duration-200
                         hover:from-violet-500 hover:to-violet-400 shadow-lg shadow-violet-500/20
                         disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Globe size={15} />
              {isLoading ? 'Generating…' : 'Generate Website Prompt'}
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
