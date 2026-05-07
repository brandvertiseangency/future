'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Lock, Sparkles, Clock, Bell } from 'lucide-react'
import { PageContainer } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'

const TOOL_META: Record<string, { title: string; description: string; features: string[]; eta: string }> = {
  'website-builder': {
    title: 'Website Builder',
    description: "Generate complete website copy, section structures, and CTA strategies grounded in your brand DNA. Perfect for Framer, Webflow, or any no-code platform.",
    features: [
      'AI-generated landing page copy',
      'Section-by-section structure',
      'CTA strategy and copywriting',
      'SEO meta titles and descriptions',
      'Brand voice consistency',
      'Multiple page templates',
    ],
    eta: 'Q3 2026',
  },
  seo: {
    title: 'SEO Optimizer',
    description: 'Supercharge your search visibility with AI-driven keyword research, meta descriptions, and content gap analysis — all tailored to your brand.',
    features: [
      'Keyword research and mapping',
      'Meta titles and descriptions',
      'Content gap analysis',
      'On-page SEO recommendations',
      'Local SEO optimization',
      'Competitor analysis',
    ],
    eta: 'Q3 2026',
  },
  'google-business': {
    title: 'Google My Business Setup',
    description: 'Create a compelling, conversion-focused Google Business Profile with AI-generated descriptions, posts, and review responses.',
    features: [
      'Business description writer',
      'GMB post generator',
      'Review response templates',
      'Q&A content creation',
      'Photo caption writer',
      'Service description generator',
    ],
    eta: 'Q4 2026',
  },
  'digital-card': {
    title: 'Digital Visiting Card',
    description: 'Design interactive digital business cards that perfectly represent your brand — complete with QR codes and instant sharing.',
    features: [
      'Custom card design',
      'QR code generation',
      'Multiple card templates',
      'Brand color integration',
      'Contact info formatting',
      'Shareable link',
    ],
    eta: 'Q4 2026',
  },
  vr: {
    title: '360 VR Generator',
    description: 'Transform your brand into immersive 360° virtual experiences — virtual showrooms, product showcases, and virtual tours.',
    features: [
      '360° scene generation',
      'Virtual showroom creation',
      'Product showcase builder',
      'Interactive hotspots',
      'Brand environment design',
      'Embeddable experiences',
    ],
    eta: 'Q1 2027',
  },
}

export default function ToolComingSoonPage() {
  const params = useParams()
  const tool = typeof params.tool === 'string' ? params.tool : ''
  const meta = TOOL_META[tool] ?? {
    title: 'Premium Tool',
    description: 'This powerful tool is coming soon.',
    features: [],
    eta: 'Soon',
  }

  return (
    <PageContainer className="max-w-2xl space-y-8">
      <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft size={16} /> Back to Tools
      </Link>

      {/* Icon + title */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted">
          <Lock size={32} className="text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{meta.title}</h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Coming Soon
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={11} /> Expected: {meta.eta}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-base leading-relaxed text-muted-foreground">{meta.description}</p>
      </div>

      {/* Features */}
      {meta.features.length > 0 && (
        <div>
          <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">What&apos;s included</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {meta.features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notify CTA */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
        <Sparkles size={20} className="text-primary" />
        <p className="text-base font-semibold text-foreground">Be the first to know</p>
        <p className="text-sm text-muted-foreground">We&apos;ll notify you when {meta.title} is ready for early access.</p>
        <Button className="gap-2">
          <Bell size={15} /> Notify Me
        </Button>
      </div>
    </PageContainer>
  )
}
