'use client'

import { Globe, Palette, Presentation, Lock, ArrowRight, Sparkles } from 'lucide-react'
import useSWR from 'swr'
import Link from 'next/link'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { AgentCard } from '@/components/agents/AgentCard'
import { Button } from '@/components/ui/button'
import { apiCall } from '@/lib/api'
import { planUnlocksAgents } from '@/lib/agent-access'
import { cn } from '@/lib/utils'

const AGENTS = [
  {
    id: 'website-builder' as const,
    title: 'Website Builder',
    description: 'Landing page structure, section copy, and CTA prompts for Framer, Webflow, or v0.',
    href: '/agents/website-builder',
    icon: Globe,
    accentClassName: 'bg-gradient-to-br from-violet-600 to-violet-500',
    capability: 'Website copy, section structure, CTA strategy',
  },
  {
    id: 'branding-kit' as const,
    title: 'Branding Kit',
    description: 'Posters, banners, and card briefs with palette and typography direction for design tools.',
    href: '/agents/branding-kit',
    icon: Palette,
    accentClassName: 'bg-gradient-to-br from-cyan-600 to-cyan-500',
    capability: 'Design briefs, colour direction, print assets',
  },
  {
    id: 'presentations' as const,
    title: 'Presentations',
    description: 'Slide-by-slide outlines and speaker notes for pitch decks and company profiles.',
    href: '/agents/presentations',
    icon: Presentation,
    accentClassName: 'bg-gradient-to-br from-amber-600 to-amber-500',
    capability: 'Pitch decks, company profiles, slide outlines',
  },
]

export default function AgentsPage() {
  const { data, isLoading } = useSWR(
    '/api/credits/balance',
    (url: string) => apiCall<{ plan?: string; balance?: number }>(url),
    { revalidateOnFocus: false },
  )
  const planUnlocked = planUnlocksAgents(data?.plan)
  const plan = data?.plan ?? 'trial'

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="agents"
        title="Meet your AI agent workspace"
        description="Each agent produces prompts and briefs grounded in your brand — paste them into your favourite tools."
      />
      <PageHeader
        variant="hero"
        title={
          <>
            AI <span className="text-pull text-primary">agents</span>
          </>
        }
        description="Specialist agents for website copy, branding, and presentations — all powered by your brand DNA."
      />

      {/* Plan gate banner */}
      {!isLoading && !planUnlocked && (
        <div className="relative overflow-hidden rounded-[var(--radius-card-lg)] border border-primary/25 bg-primary/5 p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(0,59,255,0.07),transparent)]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Unlock AI agents on Pro or Agency</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  You&apos;re on the <span className="capitalize font-medium text-foreground">{plan}</span> plan.
                  Upgrade to run full AI generations from any agent workspace.
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button size="sm" className="shrink-0 gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade plan
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Agent cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {AGENTS.map((agent) => (
          <AgentCard
            key={agent.id}
            title={agent.title}
            description={agent.description}
            href={agent.href}
            icon={agent.icon}
            accentClassName={agent.accentClassName}
            locked={!planUnlocked}
          />
        ))}
      </div>

      {/* What agents do */}
      <div className={cn(
        'rounded-[var(--radius-card)] border border-border/65 bg-card/82 p-4 backdrop-blur-sm',
      )}>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">How agents work</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { step: '01', title: 'Brand-grounded', desc: 'Every agent reads your brand profile before generating output.' },
            { step: '02', title: 'Structured briefs', desc: 'Output is formatted for direct use in Figma, Framer, Canva, or any tool.' },
            { step: '03', title: 'Iterative', desc: 'Ask follow-up questions to refine and expand any output.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="mt-0.5 text-[11px] font-bold tabular-nums text-primary">{step}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
