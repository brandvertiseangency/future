'use client'

import Link from 'next/link'
import {
  Globe,
  TrendingUp,
  MapPin,
  CreditCard,
  Rotate3D,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react'
import { PageContainer } from '@/components/ui/page-primitives'
import type { LucideIcon } from 'lucide-react'

const TOOLS: {
  id: string
  title: string
  description: string
  longDescription: string
  icon: LucideIcon
  href: string
  gradient: string
  features: string[]
}[] = [
  {
    id: 'website-builder',
    title: 'Website Builder',
    description: 'Generate landing pages, section copy, and CTAs for Framer, Webflow, or v0.',
    longDescription: 'AI-powered website content generation grounded in your brand identity.',
    icon: Globe,
    href: '/tools/website-builder',
    gradient: 'from-violet-600 to-violet-500',
    features: ['Landing page copy', 'Section structure', 'CTA strategy', 'SEO meta'],
  },
  {
    id: 'seo',
    title: 'SEO Optimizer',
    description: 'Optimize your content for search engines with AI-driven keyword and meta strategies.',
    longDescription: 'Generate SEO-optimized titles, meta descriptions, and keyword maps.',
    icon: TrendingUp,
    href: '/tools/seo',
    gradient: 'from-emerald-600 to-emerald-500',
    features: ['Keyword research', 'Meta descriptions', 'Title optimization', 'Content gaps'],
  },
  {
    id: 'google-business',
    title: 'Google My Business',
    description: 'Set up and optimize your Google Business Profile with AI-generated content.',
    longDescription: 'Create compelling business descriptions, posts, and Q&A responses.',
    icon: MapPin,
    href: '/tools/google-business',
    gradient: 'from-blue-600 to-blue-500',
    features: ['Business description', 'GMB posts', 'Review responses', 'Q&A content'],
  },
  {
    id: 'digital-card',
    title: 'Digital Visiting Card',
    description: 'Create interactive digital business cards that represent your brand perfectly.',
    longDescription: 'Generate professional digital cards with your brand visuals and information.',
    icon: CreditCard,
    href: '/tools/digital-card',
    gradient: 'from-amber-600 to-amber-500',
    features: ['Card design', 'QR code', 'Contact info', 'Brand colors'],
  },
  {
    id: 'vr',
    title: '360 VR Generator',
    description: 'Create immersive 360° virtual reality experiences and virtual tours for your brand.',
    longDescription: 'Transform your brand spaces into engaging virtual experiences.',
    icon: Rotate3D,
    href: '/tools/vr',
    gradient: 'from-cyan-600 to-cyan-500',
    features: ['360° scenes', 'Virtual tours', 'Product showcases', 'Brand experiences'],
  },
]

export default function ToolsPage() {
  return (
    <PageContainer className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Premium Tools</h1>
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
            Coming Soon
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Advanced AI-powered tools to supercharge your digital presence. All tools are powered by your brand DNA.
        </p>
      </div>

      {/* Coming soon banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_50%,rgba(74,125,255,0.08),transparent)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Premium Tools are launching soon</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                We&apos;re building powerful tools to help you grow your brand across every digital channel. Stay tuned for early access.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Sparkles size={14} /> Early Access
          </div>
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
            >
              {/* Coming soon badge */}
              <div className="absolute right-3 top-3 z-10">
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Coming Soon
                </span>
              </div>

              {/* Header gradient */}
              <div className={`flex h-24 items-end bg-gradient-to-br ${tool.gradient} p-4 opacity-90`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                  <Icon size={20} />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start gap-2">
                  <Lock size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{tool.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tool.features.map((f) => (
                    <span key={f} className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 text-xs font-semibold text-primary">
                  <span>Learn more</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </PageContainer>
  )
}
