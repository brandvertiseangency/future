'use client'

import { Globe, Palette, Presentation } from 'lucide-react'
import useSWR from 'swr'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { AgentCard } from '@/components/agents/AgentCard'
import { apiCall } from '@/lib/api'
import { planUnlocksAgents } from '@/lib/agent-access'

const AGENTS = [
  {
    id: 'website-builder' as const,
    title: 'Website Builder',
    description: 'Landing page structure, section copy, and CTA prompts for Framer, Webflow, or v0.',
    href: '/agents/website-builder',
    icon: Globe,
    accentClassName: 'bg-gradient-to-br from-violet-600 to-violet-500',
  },
  {
    id: 'branding-kit' as const,
    title: 'Branding Kit',
    description: 'Posters, banners, and card briefs with palette and typography direction for design tools.',
    href: '/agents/branding-kit',
    icon: Palette,
    accentClassName: 'bg-gradient-to-br from-cyan-600 to-cyan-500',
  },
  {
    id: 'presentations' as const,
    title: 'Presentations',
    description: 'Slide-by-slide outlines and speaker notes for pitch decks and company profiles.',
    href: '/agents/presentations',
    icon: Presentation,
    accentClassName: 'bg-gradient-to-br from-amber-600 to-amber-500',
  },
]

export default function AgentsPage() {
  const { data } = useSWR('/api/credits/balance', (url: string) => apiCall<{ plan?: string }>(url), {
    revalidateOnFocus: false,
  })
  const planUnlocked = planUnlocksAgents(data?.plan)

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
        description="Website, branding, and presentation workflows. Pro and Agency unlock generation on every agent below."
      />
      {!planUnlocked ? (
        <div className="app-card-elevated rounded-[var(--radius-card-lg)] border border-border/65 bg-card/78 p-4 text-sm text-muted-foreground shadow-[var(--shadow-card)] backdrop-blur-sm">
          <p className="font-medium text-foreground">Unlock on Pro</p>
          <p className="mt-1">Upgrade to run AI generations from this workspace. You can open each agent from the sidebar to see the interface.</p>
        </div>
      ) : null}
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
    </PageContainer>
  )
}
