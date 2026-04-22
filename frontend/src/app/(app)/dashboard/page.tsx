'use client'

import { Layers, AlertCircle, ArrowRight } from 'lucide-react'
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

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: brandData } = useSWR('/api/brands/current', fetcher, { revalidateOnFocus: false })
  const { data: userData } = useSWR('/api/users/me', fetcher<{ user: { onboarding_complete?: boolean } }>, { revalidateOnFocus: false })
  const brand = (brandData as any)?.brand ?? brandData
  const onboardingComplete = (userData as any)?.user?.onboarding_complete ?? true

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'
  const brandName = brand?.name ?? 'My Brand'

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px 64px' }}>

      {/* Onboarding incomplete banner */}
      {!onboardingComplete && (
        <Link href="/onboarding" style={{ display: 'block', marginBottom: 20, textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14, padding: '14px 18px', gap: 12,
            cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <AlertCircle size={16} color="rgba(255,255,255,0.5)" />
              </div>
              <div>
                <p style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 500, margin: 0 }}>
                  Complete your brand setup for better results
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '2px 0 0' }}>
                  Tell us about your brand so the AI can create more relevant content for you
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'var(--text-2)', fontSize: 12, fontWeight: 500, flexShrink: 0,
            }}>
              Set up now <ArrowRight size={13} />
            </div>
          </div>
        </Link>
      )}

      {/* Greeting */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: 'var(--text-4)', marginBottom: 10,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <Layers size={11} strokeWidth={1.5} />
          {brandName}
        </div>
        <h1 style={{
          fontSize: 30, fontWeight: 300, letterSpacing: '-0.035em',
          color: 'var(--text-1)', margin: 0,
        }}>
          Welcome back, <span className="silver-text" style={{ fontWeight: 500 }}>{firstName}</span>
        </h1>
      </div>

      {/* Brand AI Chat — centrepiece */}
      <BrandChat brand={brand} />

      {/* Ideas */}
      <IdeasGrid brand={brand} />

      {/* Quick Actions + Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <QuickActions />
        <GenQueue />
      </div>

      {/* Recent Outputs */}
      <RecentOutputs />
    </div>
  )
}
