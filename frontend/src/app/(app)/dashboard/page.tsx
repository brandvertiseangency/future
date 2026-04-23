'use client'

import { AlertCircle, ArrowRight, Layers } from 'lucide-react'
import useSWR from 'swr'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { apiCall } from '@/lib/api'
import { BrandChat } from '@/components/dashboard/brand-chat'
import { IdeasGrid } from '@/components/dashboard/ideas-grid'
import { GenQueue } from '@/components/dashboard/gen-queue'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentOutputs } from '@/components/dashboard/recent-outputs'

const fetcher = <T,>(url: string) => apiCall<T>(url)

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: brandData } = useSWR('/api/brands/current', fetcher, { revalidateOnFocus: false })
  const { data: userData } = useSWR('/api/users/me', fetcher<{ user: { onboarding_complete?: boolean } }>, { revalidateOnFocus: false })
  const brand = (brandData as any)?.brand ?? brandData
  const onboardingComplete = (userData as any)?.user?.onboarding_complete ?? true

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'
  const brandName = brand?.name ?? 'My Brand'
  const greeting = getGreeting()

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 72px' }}>

      {/* Onboarding banner */}
      {!onboardingComplete && (
        <Link href="/onboarding" style={{ display: 'block', marginBottom: 24, textDecoration: 'none' }}>
          <div
            className="card-silver"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: 14, padding: '14px 18px', gap: 12,
              background: 'rgba(255,255,255,0.025)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <AlertCircle size={15} color="rgba(255,255,255,0.5)" />
              </div>
              <div>
                <p style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 500, margin: 0 }}>
                  Complete your brand setup
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 11.5, margin: '2px 0 0' }}>
                  Unlock personalised AI-generated content
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
              Set up <ArrowRight size={12} />
            </div>
          </div>
        </Link>
      )}

      {/* Hero greeting */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10, color: 'var(--text-4)', marginBottom: 8,
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <Layers size={10} strokeWidth={1.5} />
          {brandName}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display, var(--font-sans))',
          fontSize: 32, fontWeight: 400,
          letterSpacing: '-0.03em',
          color: 'var(--text-1)',
          lineHeight: 1.15,
          margin: '0 0 6px',
        }}>
          {greeting},{' '}
          <span className="silver-text-anim" style={{ fontStyle: 'italic' }}>
            {firstName}
          </span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
          {onboardingComplete
            ? "Your brand AI is ready. What would you like to create today?"
            : "Finish setting up your brand to unlock the full experience."}
        </p>
      </div>

      {/* Brand AI Chat */}
      <BrandChat brand={brand} />

      {/* Content Ideas */}
      <IdeasGrid brand={brand} />

      {/* Quick Actions + Queue — 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <QuickActions />
        <GenQueue />
      </div>

      {/* Recent Outputs */}
      <RecentOutputs />
    </div>
  )
}
