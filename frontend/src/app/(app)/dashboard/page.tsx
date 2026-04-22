'use client'

import { Layers } from 'lucide-react'
import useSWR from 'swr'
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
  const brand = (brandData as any)?.brand ?? brandData

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'
  const brandName = brand?.name ?? 'My Brand'

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px 64px' }}>

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
